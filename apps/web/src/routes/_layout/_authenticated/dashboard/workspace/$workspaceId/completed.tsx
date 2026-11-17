import { createFileRoute } from "@tanstack/react-router";
import { startOfDay } from "date-fns";
import { CircleCheckBig } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import { CompletedDateFilter } from "@/components/completed-tasks/completed-date-filter";
import { MyTasksList } from "@/components/my-tasks/my-tasks-list";
import PageTitle from "@/components/page-title";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import useGetCompletedTasks from "@/hooks/queries/task/use-get-completed-tasks";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/completed",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const { data, isLoading, isError } = useGetCompletedTasks(workspaceId, day);

  return (
    <>
      <PageTitle title={t("workspace:completedTasks.pageTitle")} />
      <WorkspaceLayout
        title={t("workspace:completedTasks.pageTitle")}
        className="min-w-0 shrink"
        headerActions={<CompletedDateFilter value={day} onChange={setDay} />}
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
          ) : isError && !data ? (
            <p role="alert" className="p-6 text-muted-foreground text-sm">
              {t("workspace:myWork.loadError")}
            </p>
          ) : !data?.tasks.length ? (
            <Empty className="min-h-[60vh]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleCheckBig />
                </EmptyMedia>
                <EmptyTitle>{t("workspace:completedTasks.empty")}</EmptyTitle>
                <EmptyDescription>
                  {t("workspace:completedTasks.emptyDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <MyTasksList
                tasks={data.tasks}
                workspaceId={workspaceId}
                allowCreate={false}
              />
              {data.total > data.tasks.length && (
                <p className="px-5 py-3 text-muted-foreground text-xs">
                  {t("workspace:myTasks.truncated", {
                    shown: data.tasks.length,
                    total: data.total,
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
