import { and, count, eq, gte, isNull, lt, ne, sql } from "drizzle-orm";
import db from "../../database";
import { activityTable, projectTable, taskTable } from "../../database/schema";
import { projectAccessCondition } from "../../project-access/project-access-condition";
import {
  assignedStatusColumn,
  assignedTaskFields,
  taskIsDone,
} from "../assigned/assigned-task-fields";
import { attachTaskLabels } from "../assigned/attach-task-labels";
import { ASSIGNED_TASKS_LIMIT } from "./get-assigned-tasks";

// Tasks store no completion time. Every status change logs an activity, and a
// done task's latest one is the move that finished it. Tasks created or
// imported straight into a final column never logged one.
const completedAt = sql<Date>`coalesce((
  select max(${activityTable.createdAt}) from ${activityTable}
  where ${activityTable.taskId} = ${taskTable.id}
    and ${activityTable.type} = 'status_changed'
), ${taskTable.createdAt})`;

async function getCompletedTasks(
  workspaceId: string,
  userId: string,
  from: Date,
  to: Date,
) {
  const doneAndMine = and(
    eq(projectTable.workspaceId, workspaceId),
    isNull(projectTable.archivedAt),
    eq(taskTable.userId, userId),
    ne(taskTable.status, "archived"),
    taskIsDone,
    gte(completedAt, from),
    lt(completedAt, to),
    projectAccessCondition(userId, projectTable.id),
  );

  const [tasks, [totals]] = await Promise.all([
    db
      .select(assignedTaskFields)
      .from(taskTable)
      .innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
      .leftJoinLateral(assignedStatusColumn, sql`true`)
      .where(doneAndMine)
      .orderBy(sql`${completedAt} desc`, sql`${taskTable.id} asc`)
      .limit(ASSIGNED_TASKS_LIMIT),
    db
      .select({ total: count() })
      .from(taskTable)
      .innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
      .where(doneAndMine),
  ]);

  return {
    tasks: await attachTaskLabels(tasks),
    total: Number(totals?.total ?? 0),
  };
}

export default getCompletedTasks;
