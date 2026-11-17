import { and, asc, count, desc, eq, isNull, ne, not, sql } from "drizzle-orm";
import db from "../../database";
import { projectTable, taskTable } from "../../database/schema";
import { projectAccessCondition } from "../../project-access/project-access-condition";
import {
  assignedStatusColumn,
  assignedTaskFields,
  taskIsDone,
} from "../assigned/assigned-task-fields";
import { attachTaskLabels } from "../assigned/attach-task-labels";

// Home and My tasks render this list whole, so it stays one bounded page.
export const ASSIGNED_TASKS_LIMIT = 100;

const priorityRank = sql<number>`CASE
  WHEN ${taskTable.priority} = 'urgent' THEN 4
  WHEN ${taskTable.priority} = 'high' THEN 3
  WHEN ${taskTable.priority} = 'medium' THEN 2
  WHEN ${taskTable.priority} = 'low' THEN 1
  ELSE 0
END`;

async function getAssignedTasks(
  workspaceId: string,
  userId: string,
  countOnly = false,
) {
  const openAndMine = and(
    eq(projectTable.workspaceId, workspaceId),
    isNull(projectTable.archivedAt),
    eq(taskTable.userId, userId),
    ne(taskTable.status, "archived"),
    not(taskIsDone),
    projectAccessCondition(userId, projectTable.id),
  );

  const totalsQuery = db
    .select({ total: count() })
    .from(taskTable)
    .innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
    .where(openAndMine);

  if (countOnly) {
    const [totals] = await totalsQuery;
    return { tasks: [], total: Number(totals?.total ?? 0) };
  }

  const [tasks, [totals]] = await Promise.all([
    db
      .select(assignedTaskFields)
      .from(taskTable)
      .innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
      .leftJoinLateral(assignedStatusColumn, sql`true`)
      .where(openAndMine)
      .orderBy(
        sql`${taskTable.dueDate} asc nulls last`,
        desc(priorityRank),
        asc(taskTable.createdAt),
        asc(taskTable.id),
      )
      .limit(ASSIGNED_TASKS_LIMIT),
    totalsQuery,
  ]);

  return {
    tasks: await attachTaskLabels(tasks),
    total: Number(totals?.total ?? 0),
  };
}

export default getAssignedTasks;
