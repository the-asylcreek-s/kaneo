import { addDays, isToday, startOfDay } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MonthGrid } from "@/components/common/date-picker/month-grid";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDay } from "./day-label";

type CompletedDateFilterProps = {
  value: Date;
  onChange: (day: Date) => void;
};

// Completion only happens in the past, so days after today stay disabled.
export function CompletedDateFilter({
  value,
  onChange,
}: CompletedDateFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const atToday = isToday(value);

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={t("workspace:completedTasks.previousDay")}
        title={t("workspace:completedTasks.previousDay")}
        onClick={() => onChange(addDays(value, -1))}
      >
        <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-28 font-normal"
            />
          }
        >
          <CalendarDays aria-hidden="true" />
          {formatDay(value, t)}
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className="w-65 p-0">
          <MonthGrid
            value={value}
            disabled={[{ after: startOfDay(new Date()) }]}
            onSelect={(day) => {
              onChange(startOfDay(day));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={t("workspace:completedTasks.nextDay")}
        title={t("workspace:completedTasks.nextDay")}
        disabled={atToday}
        onClick={() => onChange(addDays(value, 1))}
      >
        <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
      </Button>
    </div>
  );
}
