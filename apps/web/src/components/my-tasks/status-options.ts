import { DEFAULT_COLUMNS } from "@/constants/columns";
import type { AssignedTask } from "@/fetchers/task/get-assigned-tasks";

export type StatusOption = {
  slug: string;
  name: string | null;
  icon: string | null;
};

export type StatusFilterProps = {
  options: StatusOption[];
  value: ReadonlySet<string>;
  onChange: (value: Set<string>) => void;
};

const defaultOrder = new Map<string, number>(
  DEFAULT_COLUMNS.map((column, index) => [column.id, index]),
);

// Each project defines its own statuses, so options merge by slug. The API
// does not send column positions; default statuses keep workflow order and
// custom ones follow alphabetically.
export function getStatusOptions(tasks: AssignedTask[]): StatusOption[] {
  const bySlug = new Map<string, StatusOption>();

  for (const task of tasks) {
    if (bySlug.has(task.status)) continue;
    bySlug.set(task.status, {
      slug: task.status,
      name: task.statusName,
      icon: task.statusIcon,
    });
  }

  return [...bySlug.values()].sort((a, b) => {
    const aOrder = defaultOrder.get(a.slug) ?? Number.POSITIVE_INFINITY;
    const bOrder = defaultOrder.get(b.slug) ?? Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.name ?? a.slug).localeCompare(b.name ?? b.slug);
  });
}

// An empty selection means no filter.
export function filterTasksByStatus(
  tasks: AssignedTask[],
  statuses: ReadonlySet<string>,
): AssignedTask[] {
  if (statuses.size === 0) return tasks;
  return tasks.filter((task) => statuses.has(task.status));
}
