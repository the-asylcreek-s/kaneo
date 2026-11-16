import { MyTasksStatusChips } from "./my-tasks-status-chips";
import { MyTasksStatusMenu } from "./my-tasks-status-menu";
import type { StatusFilterProps } from "./status-options";

// Wide screens list every status inline; narrow ones collapse into a menu.
export function MyTasksStatusFilter(props: StatusFilterProps) {
  return (
    <>
      <MyTasksStatusChips {...props} className="hidden lg:flex" />
      <div className="lg:hidden">
        <MyTasksStatusMenu {...props} />
      </div>
    </>
  );
}
