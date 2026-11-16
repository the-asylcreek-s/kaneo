import { ListFilter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { getColumnIcon } from "@/lib/column";
import { cn } from "@/lib/cn";
import { getStatusDisplayLabel } from "@/lib/i18n/domain";
import type { StatusFilterProps } from "./status-options";

export function MyTasksStatusMenu({
  options,
  value,
  onChange,
}: StatusFilterProps) {
  const { t } = useTranslation();

  const toggle = (slug: string, checked: boolean) => {
    const next = new Set(value);
    if (checked) next.add(slug);
    else next.delete(slug);
    onChange(next);
  };

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            type="button"
            variant={value.size > 0 ? "secondary" : "ghost"}
            size="xs"
            className={cn(value.size === 0 && "text-muted-foreground")}
          />
        }
      >
        <ListFilter aria-hidden="true" />
        {t("workspace:myTasks.statusFilter.label")}
        {value.size > 0 && <span className="tabular-nums">{value.size}</span>}
      </MenuTrigger>
      <MenuPopup align="end">
        {options.map((option) => (
          <MenuCheckboxItem
            key={option.slug}
            checked={value.has(option.slug)}
            onCheckedChange={(checked) => toggle(option.slug, checked)}
          >
            <span className="flex items-center gap-2">
              {getColumnIcon(option.slug, false, option.icon)}
              {getStatusDisplayLabel(option.slug, option.name ?? undefined)}
            </span>
          </MenuCheckboxItem>
        ))}
        {value.size > 0 && (
          <>
            <MenuSeparator />
            <MenuItem onClick={() => onChange(new Set())}>
              {t("workspace:myTasks.statusFilter.clear")}
            </MenuItem>
          </>
        )}
      </MenuPopup>
    </Menu>
  );
}
