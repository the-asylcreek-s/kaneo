import { useQuery } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";
import getCompletedTasks from "@/fetchers/task/get-completed-tasks";

// Shares the "assigned-tasks" prefix so every task change that refreshes My
// tasks refreshes this list too.
function useGetCompletedTasks(workspaceId: string, day: Date) {
  const from = startOfDay(day);
  const to = addDays(from, 1);

  return useQuery({
    queryKey: ["assigned-tasks", workspaceId, "completed", from.toISOString()],
    queryFn: () => getCompletedTasks(workspaceId, from, to),
    refetchOnMount: "always",
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
  });
}

export default useGetCompletedTasks;
