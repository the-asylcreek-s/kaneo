import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getColumnIcon } from "@/lib/column";
import { cn } from "@/lib/cn";
import { getStatusDisplayLabel } from "@/lib/i18n/domain";
import type { StatusFilterProps } from "./status-options";

export function MyTasksStatusChips({
  options,
  value,
  onChange,
  className,
}: StatusFilterProps & { className?: string }) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      multiple
      size="sm"
      aria-label={t("workspace:myTasks.statusFilter.label")}
      value={[...value]}
      onValueChange={(next) => onChange(new Set(next))}
      className={cn("max-w-full overflow-x-auto", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.slug}
          value={option.slug}
          className="gap-1.5 px-2 font-normal text-muted-foreground text-xs data-pressed:text-foreground sm:text-xs"
        >
          {getColumnIcon(option.slug, false, option.icon)}
          {getStatusDisplayLabel(option.slug, option.name ?? undefined)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
