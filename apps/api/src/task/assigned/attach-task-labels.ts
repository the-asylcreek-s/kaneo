import { asc, inArray } from "drizzle-orm";
import db from "../../database";
import { labelTable } from "../../database/schema";

type TaskLabel = { id: string; name: string; color: string };

export async function attachTaskLabels<T extends { id: string }>(
  tasks: T[],
): Promise<Array<T & { labels: TaskLabel[] }>> {
  if (tasks.length === 0) return [];

  const labels = await db
    .select({
      id: labelTable.id,
      name: labelTable.name,
      color: labelTable.color,
      taskId: labelTable.taskId,
    })
    .from(labelTable)
    .where(
      inArray(
        labelTable.taskId,
        tasks.map((task) => task.id),
      ),
    )
    .orderBy(asc(labelTable.name), asc(labelTable.id));

  const labelsByTask = new Map<string, TaskLabel[]>();
  for (const { taskId, ...label } of labels) {
    if (!taskId) continue;
    const taskLabels = labelsByTask.get(taskId) ?? [];
    taskLabels.push(label);
    labelsByTask.set(taskId, taskLabels);
  }

  return tasks.map((task) => ({
    ...task,
    labels: labelsByTask.get(task.id) ?? [],
  }));
}
