import { and, asc, eq, sql } from "drizzle-orm";
import db from "../../database";
import { columnTable, projectTable, taskTable } from "../../database/schema";
import { taskIsCompleted } from "../task-is-completed";

// Existing databases may contain duplicate slugs from concurrent column
// creation. A lateral lookup must return at most one decoration per task.
export const assignedStatusColumn = db
  .select({ name: columnTable.name, icon: columnTable.icon })
  .from(columnTable)
  .where(
    and(
      eq(columnTable.projectId, taskTable.projectId),
      eq(columnTable.slug, taskTable.status),
    ),
  )
  .orderBy(
    sql`case when ${columnTable.id} = ${taskTable.columnId} then 0 else 1 end`,
    asc(columnTable.position),
    asc(columnTable.createdAt),
    asc(columnTable.id),
  )
  .limit(1)
  .as("assigned_status_column");

export const assignedTaskFields = {
  id: taskTable.id,
  projectId: taskTable.projectId,
  number: taskTable.number,
  title: taskTable.title,
  status: taskTable.status,
  statusName: assignedStatusColumn.name,
  statusIcon: assignedStatusColumn.icon,
  priority: taskTable.priority,
  dueDate: taskTable.dueDate,
  projectName: projectTable.name,
  projectSlug: projectTable.slug,
  projectIcon: projectTable.icon,
};

// The referenced column decides when it exists; legacy tasks without one fall
// back to their status slug.
export const taskIsDone = sql<boolean>`coalesce((
  select ${columnTable.isFinal} from ${columnTable}
  where ${columnTable.id} = ${taskTable.columnId}
    and ${columnTable.projectId} = ${taskTable.projectId}
), ${taskIsCompleted})`;
