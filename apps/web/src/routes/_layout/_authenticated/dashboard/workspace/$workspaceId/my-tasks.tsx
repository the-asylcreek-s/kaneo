import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import { MyTasksList } from "@/components/my-tasks/my-tasks-list";
import { MyTasksStatusFilter } from "@/components/my-tasks/my-tasks-status-filter";
import {
  filterTasksByStatus,
  getStatusOptions,
} from "@/components/my-tasks/status-options";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import useGetAssignedTasks from "@/hooks/queries/task/use-get-assigned-tasks";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/my-tasks",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const {
    data: assigned,
    isLoading,
    isError,
  } = useGetAssignedTasks(workspaceId);
  const [statuses, setStatuses] = useState<Set<string>>(() => new Set());
  const tasks = assigned?.tasks;
  const statusOptions = useMemo(() => getStatusOptions(tasks ?? []), [tasks]);
  const visibleTasks = useMemo(
    () => filterTasksByStatus(tasks ?? [], statuses),
    [tasks, statuses],
  );

  return (
    <>
      <PageTitle title={t("workspace:myTasks.pageTitle")} />
      <WorkspaceLayout
        title={t("workspace:myTasks.pageTitle")}
        className="min-w-0 shrink"
        headerActions={
          tasks?.length ? (
            <MyTasksStatusFilter
              options={statusOptions}
              value={statuses}
              onChange={setStatuses}
            />
          ) : null
        }
      >
        <div className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col px-4">
              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="flex h-11 items-center gap-3 border-border/50 border-b px-1"
                >
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-3.5 flex-1" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          ) : isError && !assigned ? (
            <p role="alert" className="p-6 text-muted-foreground text-sm">
              {t("workspace:myWork.loadError")}
            </p>
          ) : !assigned?.tasks.length ? (
            <Empty className="min-h-[60vh]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleCheck />
                </EmptyMedia>
                <EmptyTitle>{t("workspace:myWork.empty")}</EmptyTitle>
                <EmptyDescription>
                  {t("workspace:myTasks.emptyDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : visibleTasks.length === 0 ? (
            <Empty className="min-h-[60vh]">
              <EmptyHeader>
                <EmptyTitle>
                  {t("workspace:myTasks.statusFilter.noMatches")}
                </EmptyTitle>
              </EmptyHeader>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatuses(new Set())}
              >
                {t("workspace:myTasks.statusFilter.clear")}
              </Button>
            </Empty>
          ) : (
            <>
              <MyTasksList tasks={visibleTasks} workspaceId={workspaceId} />
              {assigned.total > assigned.tasks.length && (
                <p className="px-5 py-3 text-muted-foreground text-xs">
                  {t("workspace:myTasks.truncated", {
                    shown: assigned.tasks.length,
                    total: assigned.total,
                  })}
                </p>
              )}
            </>
          )}
        </div>
      </WorkspaceLayout>
    </>
  );
}
