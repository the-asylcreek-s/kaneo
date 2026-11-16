import { describe, expect, it } from "vite-plus/test";
import type { AssignedTask } from "@/fetchers/task/get-assigned-tasks";
import { filterTasksByStatus, getStatusOptions } from "./status-options";

function task(
  id: string,
  status: string,
  statusName: string | null = null,
): AssignedTask {
  return {
    id,
    projectId: "project-1",
    number: 1,
    title: id,
    status,
    statusName,
    statusIcon: null,
    priority: "medium",
    dueDate: null,
    projectName: "Project",
    projectSlug: "WEB",
    projectIcon: null,
    labels: [],
  };
}

describe("getStatusOptions", () => {
  it("merges statuses by slug across projects", () => {
    const options = getStatusOptions([
      task("a", "to-do", "To Do"),
      task("b", "to-do", "Todo"),
    ]);

    expect(options).toEqual([{ slug: "to-do", name: "To Do", icon: null }]);
  });

  it("keeps default workflow order and sorts custom statuses after", () => {
    const options = getStatusOptions([
      task("a", "blocked", "Blocked"),
      task("b", "in-review", "In Review"),
      task("c", "awaiting-qa", "Awaiting QA"),
      task("d", "to-do", "To Do"),
      task("e", "in-progress", "In Progress"),
    ]);

    expect(options.map((option) => option.slug)).toEqual([
      "to-do",
      "in-progress",
      "in-review",
      "awaiting-qa",
      "blocked",
    ]);
  });
});

describe("filterTasksByStatus", () => {
  const tasks = [task("a", "to-do"), task("b", "in-progress")];

  it("returns every task when nothing is selected", () => {
    expect(filterTasksByStatus(tasks, new Set())).toBe(tasks);
  });

  it("keeps only tasks in the selected statuses", () => {
    expect(
      filterTasksByStatus(tasks, new Set(["in-progress"])).map(
        (item) => item.id,
      ),
    ).toEqual(["b"]);
  });
});
