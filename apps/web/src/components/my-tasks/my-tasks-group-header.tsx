import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type MyTasksGroupHeaderProps = {
  workspaceId: string;
  projectId: string;
  title: string;
  count: number;
  onCreateTask?: () => void;
};

export function MyTasksGroupHeader({
  workspaceId,
  projectId,
  title,
  count,
  onCreateTask,
}: MyTasksGroupHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-9 items-center gap-2 border-border/50 border-b bg-muted/40 pr-3 pl-5">
      <h2 className="flex min-w-0 items-center gap-2 text-[13px]">
        <Link
          to="/dashboard/workspace/$workspaceId/project/$projectId/board"
          params={{ workspaceId, projectId }}
          className="truncate font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          {title}
        </Link>
        <span className="font-normal text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      </h2>
      {onCreateTask && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ml-auto text-muted-foreground"
          aria-label={t("workspace:myTasks.createTaskIn", { project: title })}
          title={t("workspace:myTasks.createTaskIn", { project: title })}
          onClick={onCreateTask}
        >
          <Plus aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
