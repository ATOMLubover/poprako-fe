import clsx from "clsx";
import LoadingCircle from "@/components/ui/LoadingCircle";
import AppDialog, { AppDialogAction } from "@/components/ui/AppDialog";

type Props = {
  open: boolean;
  title: string;
  description: string;
  progress: number;
  onCancel: () => void;
};

export default function ExportProgressDialog({
  open,
  title,
  description,
  progress,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <AppDialog
      title={title}
      description={description}
      onClose={onCancel}
      showClose={false}
      closeOnBackdrop={false}
      footer={(
        <div className="flex">
          <AppDialogAction onClick={onCancel}>
            取消下载
          </AppDialogAction>
        </div>
      )}
    >
      <div className="flex items-center gap-3">
        <LoadingCircle
          size={20}
          className="inline-flex shrink-0 animate-spin text-green-500"
          aria-label="exporting"
        />
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-green-50">
            <div
              className={clsx(
                "h-full rounded-full bg-(--color-green-500)",
                "transition-[width] duration-200",
              )}
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs tabular-nums text-slate-400">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </AppDialog>
  );
}
