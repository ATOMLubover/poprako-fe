import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { TermbaseInfo } from "@/types/termbase";
import type { UpdateTermbaseArgs } from "@/features/BaseTranslator/types/terminology";
import { AppDialogAction } from "@/components/ui/AppDialog";
import TerminologyDialogFrame from "./TerminologyDialogFrame";

type Props = {
  termbase?: TermbaseInfo;
  onSave: (args: UpdateTermbaseArgs) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onClose: () => void;
};

export default function TermbaseEditorDialog({
  termbase,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState(termbase?.name ?? "");
  const [description, setDescription] = useState(termbase?.description ?? "");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = termbase !== undefined;
  const isValid = name.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    const success = await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleDelete = async () => {
    if (!onDelete || isSubmitting) return;
    setIsSubmitting(true);
    const success = await onDelete();
    setIsSubmitting(false);
    if (success) onClose();
  };

  if (isConfirmingDelete && termbase && onDelete) {
    return (
      <TerminologyDialogFrame
        title="删除术语库"
        locked={isSubmitting}
        onClose={onClose}
        footer={(
          <div className="flex gap-2">
            <AppDialogAction
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsConfirmingDelete(false)}
            >
              返回
            </AppDialogAction>
            <AppDialogAction
              type="button"
              tone="danger"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              {isSubmitting && <LoaderCircle size={13} className="animate-spin" />}
              确认删除
            </AppDialogAction>
          </div>
        )}
      >
        <div className="rounded-md border border-red-100 bg-red-50/60 px-3 py-2.5">
          <p className="text-sm font-semibold text-slate-700">{termbase.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-red-500">
            删除后，其中全部术语也会一并删除。
          </p>
        </div>
      </TerminologyDialogFrame>
    );
  }

  return (
    <TerminologyDialogFrame
      title={isEditing ? "编辑术语库" : "新建术语库"}
      locked={isSubmitting}
      onClose={onClose}
      footer={(
        <div className="flex items-center gap-2">
          {isEditing && onDelete && (
            <button
              type="button"
              aria-label="删除术语库"
              disabled={isSubmitting}
              onClick={() => setIsConfirmingDelete(true)}
              className={clsx(
                "flex size-8 items-center justify-center rounded-md border",
                "border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600",
              )}
            >
              <Trash2 size={13} />
            </button>
          )}
          <div className="flex-1" />
          <AppDialogAction
            type="button"
            grow={false}
            disabled={isSubmitting}
            onClick={onClose}
          >
            取消
          </AppDialogAction>
          <AppDialogAction
            type="button"
            tone="brand"
            grow={false}
            disabled={!isValid || isSubmitting}
            onClick={handleSave}
            className="min-w-18"
          >
            {isSubmitting && <LoaderCircle size={13} className="animate-spin" />}
            保存
          </AppDialogAction>
        </div>
      )}
    >
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">名称</span>
          <input
            autoFocus
            value={name}
            disabled={isSubmitting}
            onChange={(event) => setName(event.target.value)}
            className={clsx(
              "h-8 w-full rounded-md border border-slate-200 bg-white px-2.5",
              "text-sm text-slate-700 shadow-sm shadow-slate-100 outline-none",
              "transition-colors focus:border-slate-300",
            )}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">描述</span>
          <textarea
            rows={3}
            value={description}
            disabled={isSubmitting}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="选填"
            className={clsx(
              "w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-2",
              "text-sm leading-relaxed text-slate-700 shadow-sm shadow-slate-100",
              "outline-none placeholder:text-slate-300 focus:border-slate-300",
            )}
          />
        </label>
      </div>
    </TerminologyDialogFrame>
  );
}
