import { useMemo, useState } from "react";
import { AssignedTaskRow } from "@/components/my-work/assigned-task-row";
import { groupAssignedTasksByProject } from "@/components/my-work/group-assigned-tasks";
import CreateTaskModal from "@/components/shared/modals/create-task-modal";
import type { AssignedTask } from "@/fetchers/task/get-assigned-tasks";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { authClient } from "@/lib/auth-client";
import { MyTasksGroupHeader } from "./my-tasks-group-header";

type MyTasksListProps = {
  tasks: AssignedTask[];
  workspaceId: string;
  allowCreate?: boolean;
};

export function MyTasksList({
  tasks,
  workspaceId,
  allowCreate = true,
}: MyTasksListProps) {
  const groups = useMemo(() => groupAssignedTasksByProject(tasks), [tasks]);
  const { canCreateTasks } = useWorkspacePermission();
  const { data: session } = authClient.useSession();
  const [createInProjectId, setCreateInProjectId] = useState<string>();

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section key={group.id}>
          <MyTasksGroupHeader
            workspaceId={workspaceId}
            projectId={group.id}
            title={group.title}
            count={group.tasks.length}
            onCreateTask={
              allowCreate && canCreateTasks()
                ? () => setCreateInProjectId(group.id)
                : undefined
            }
          />
          <div className="flex flex-col px-4">
            {group.tasks.map((task) => (
              <AssignedTaskRow
                key={task.id}
                task={task}
                workspaceId={workspaceId}
                showLabels
                showStatus
                showProject={false}
              />
            ))}
          </div>
        </section>
      ))}
      {/* Prefill the assignee so the new task shows up on this page. */}
      <CreateTaskModal
        open={Boolean(createInProjectId)}
        projectId={createInProjectId}
        defaultAssigneeId={session?.user.id}
        onClose={() => setCreateInProjectId(undefined)}
      />
    </div>
  );
}
