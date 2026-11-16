import type { AssignedTask } from "@/fetchers/task/get-assigned-tasks";

export type AssignedTaskGroup = {
  id: string;
  title: string;
  tasks: AssignedTask[];
};

// Groups appear in the order their first task does, which keeps the project
// with the most pressing work on top.
export function groupAssignedTasksByProject(
  tasks: AssignedTask[],
): AssignedTaskGroup[] {
  const byProject = new Map<string, AssignedTaskGroup>();

  for (const task of tasks) {
    const group = byProject.get(task.projectId) ?? {
      id: task.projectId,
      title: task.projectName,
      tasks: [],
    };
    group.tasks.push(task);
    byProject.set(task.projectId, group);
  }

  return [...byProject.values()];
}
