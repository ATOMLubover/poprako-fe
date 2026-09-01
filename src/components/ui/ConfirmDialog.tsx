import LoadingCircle from "@/components/ui/LoadingCircle";
import AppDialog, { AppDialogAction } from "@/components/ui/AppDialog";

interface Props {
  title: string;
  description?: string | undefined;
  children?: React.ReactNode | undefined;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  onConfirm?: (() => void) | undefined;
  onCancel: () => void;
  loading?: boolean | undefined;
  confirmDisabled?: boolean | undefined;
  confirmTone?: "danger" | "success" | undefined;
  hideFooter?: boolean | undefined;
}

export default function ConfirmDialog({
  title,
  description,
  children,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
  loading = false,
  confirmDisabled = false,
  confirmTone = "danger",
  hideFooter = false,
}: Props) {
  return (
    <AppDialog
      title={title}
      description={description}
      size="compact"
      tone="warning"
      onClose={onCancel}
      bodyClassName={children ? "p-0" : "hidden"}
      footer={hideFooter ? undefined : (
        <div className="flex items-center gap-2">
          <AppDialogAction onClick={onCancel}>
            {cancelLabel}
          </AppDialogAction>
          <AppDialogAction
            tone={confirmTone === "success" ? "brand" : "danger"}
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? <LoadingCircle /> : confirmLabel}
          </AppDialogAction>
        </div>
      )}
    >
      {children}
    </AppDialog>
  );
}
