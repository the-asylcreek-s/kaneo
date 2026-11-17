import { beforeEach, describe, expect, it } from "vite-plus/test";
import db, { schema } from "../../apps/api/src/database";
import { createApp } from "../../apps/api/src/index";
import { mockAuthenticatedSession } from "./helpers/auth";
import { resetTestDatabase } from "./helpers/database";
import {
  createProjectFixture,
  createWorkspaceMember,
} from "./helpers/fixtures";

type CompletedTasksResponse = {
  tasks: Array<{ id: string; statusName: string | null }>;
  total: number;
};

const from = "2030-03-10T00:00:00.000Z";
const to = "2030-03-11T00:00:00.000Z";

describe("API integration: completed tasks", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("lists the caller's tasks completed within the window, newest first", async () => {
    const member = await createWorkspaceMember();
    const { project, columns } = await createProjectFixture({
      workspaceId: member.workspace.id,
    });

    const base = {
      projectId: project.id,
      priority: "medium",
      position: 1,
      userId: member.user.id,
      createdAt: new Date("2030-03-01T09:00:00.000Z"),
    };
    const done = {
      ...base,
      status: "done",
      columnId: columns.done.id,
    };
    const [early, late, outside, reopened, createdDone] = await db
      .insert(schema.taskTable)
      .values([
        { ...done, title: "Finished early", number: 1 },
        { ...done, title: "Finished late", number: 2 },
        { ...done, title: "Finished the day before", number: 3 },
        {
          ...base,
          title: "Reopened",
          status: "to-do",
          columnId: columns.todo.id,
          number: 4,
        },
        {
          ...done,
          title: "Created as done",
          number: 5,
          createdAt: new Date("2030-03-10T12:00:00.000Z"),
        },
      ])
      .returning();

    const statusChange = (taskId: string, at: string) => ({
      taskId,
      type: "status_changed",
      userId: member.user.id,
      createdAt: new Date(at),
    });
    await db.insert(schema.activityTable).values([
      statusChange(early.id, "2030-03-10T08:00:00.000Z"),
      // An older change must not hide the latest one.
      statusChange(late.id, "2030-03-09T08:00:00.000Z"),
      statusChange(late.id, "2030-03-10T20:00:00.000Z"),
      statusChange(outside.id, "2030-03-09T23:59:59.000Z"),
      statusChange(reopened.id, "2030-03-10T10:00:00.000Z"),
    ]);

    mockAuthenticatedSession(member.user);
    const { app } = createApp();
    const response = await app.request(
      `/api/task/completed?workspaceId=${member.workspace.id}&from=${from}&to=${to}`,
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as CompletedTasksResponse;
    expect(body.total).toBe(3);
    expect(body.tasks.map((task) => task.id)).toEqual([
      late.id,
      createdDone.id,
      early.id,
    ]);
    expect(body.tasks[0]?.statusName).toBe(columns.done.name);
  });

  it("rejects a window that is not an ISO timestamp", async () => {
    const member = await createWorkspaceMember();
    mockAuthenticatedSession(member.user);
    const { app } = createApp();

    const response = await app.request(
      `/api/task/completed?workspaceId=${member.workspace.id}&from=yesterday&to=${to}`,
    );
    expect(response.status).toBe(400);
  });

  it("refuses a workspace the caller does not belong to", async () => {
    const member = await createWorkspaceMember();
    const outsider = await createWorkspaceMember();
    mockAuthenticatedSession(outsider.user);
    const { app } = createApp();

    const response = await app.request(
      `/api/task/completed?workspaceId=${member.workspace.id}&from=${from}&to=${to}`,
    );
    expect(response.status).toBe(404);
  });
});
