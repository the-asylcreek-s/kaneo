import { describe, expect, it } from "vite-plus/test";
import type { AssignedTask } from "@/fetchers/task/get-assigned-tasks";
import { groupAssignedTasksByProject } from "./group-assigned-tasks";

function task(
  id: string,
  dueDate: Date | null,
  projectId = "project-1",
): AssignedTask {
  return {
    id,
    projectId,
    number: 1,
    title: id,
    status: "to-do",
    statusName: "To Do",
    statusIcon: null,
    priority: "medium",
    dueDate: dueDate ? dueDate.toISOString() : null,
    projectName: projectId,
    projectSlug: "WEB",
    projectIcon: null,
    labels: [],
  };
}

describe("groupAssignedTasksByProject", () => {
  it("keeps projects in the order their first task appears", () => {
    const groups = groupAssignedTasksByProject([
      task("a", null, "api"),
      task("b", null, "web"),
      task("c", null, "api"),
    ]);

    expect(groups.map((group) => group.id)).toEqual(["api", "web"]);
    expect(groups[0].tasks.map((item) => item.id)).toEqual(["a", "c"]);
  });
});
