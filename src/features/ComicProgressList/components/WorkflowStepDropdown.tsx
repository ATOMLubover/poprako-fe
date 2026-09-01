import clsx from "clsx";
import type { WorkflowStatus } from "@/types/workflow";

interface Props {
  status: WorkflowStatus;
  names: string[];
}

const STATUS_LABELS: Record<WorkflowStatus, string> = {
  pending: "待开始",
  ongoing: "进行中",
  completed: "已完成",
  unset: "未设置",
};

export default function WorkflowStepDropdown({ status, names }: Props) {
  return (
    <div
      className={clsx(
        "absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20",
        "bg-white/95 border border-stone-200 rounded-sm shadow-sm",
        "py-1.5 px-2.5 whitespace-nowrap",
      )}
    >
      <div className="flex flex-col gap-1 text-xs">
        <div>
          <div className="font-bold text-stone-500 text-center">状态</div>
          <div className="text-stone-400 italic text-center">
            {STATUS_LABELS[status]}
          </div>
        </div>
        <div>
          <div className="font-bold text-stone-500 text-center">成员</div>
          {names.length > 0 ? (
            names.map((name) => (
              <div key={name} className="text-stone-400 italic text-center">
                {name}
              </div>
            ))
          ) : (
            <div className="text-stone-400 italic text-center">—</div>
          )}
        </div>
      </div>
    </div>
  );
}
