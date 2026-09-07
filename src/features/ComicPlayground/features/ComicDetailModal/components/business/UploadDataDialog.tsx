import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  CircleAlert,
  CloudUpload,
  FileStack,
  FileUp,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";
import clsx from "clsx";
import AppDialog, { AppDialogAction } from "@/components/ui/AppDialog";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { toApiRequestError } from "@/api/util";
import { allocArtwork, markArtworkUploaded } from
  "@/features/ComicPlayground/api/artwork";
import { uploadToPresignedUrl } from "@/features/ComicPlayground/api/page";
import { prepareArtwork, validateArtworkFiles, type PreparedArtwork } from
  "../../artworkUpload";

interface Props {
  chapterId: string;
  chapterLabel: string;
  canUploadTranslation: boolean;
  canUploadArtwork: boolean;
  isImportingTranslation: boolean;
  onImportTranslation?: ((event: ChangeEvent<HTMLInputElement>) => Promise<boolean>) | undefined;
  onArtworkUploaded: () => void;
  onClose: () => void;
}

type Phase = "ready" | "compress" | "upload" | "confirm" | "done" | "error"
  | "cancelled";
type UploadTab = "translation" | "artwork";

function formatSize(bytes: number) {
  return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
}

export default function UploadDataDialog({
  chapterId,
  chapterLabel,
  canUploadTranslation,
  canUploadArtwork,
  isImportingTranslation,
  onImportTranslation,
  onArtworkUploaded,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<UploadTab>(
    canUploadTranslation ? "translation" : "artwork",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const translationInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const preparedRef = useRef<PreparedArtwork | null>(null);
  const uploadedVersionRef = useRef<number | null>(null);
  const { showToast } = useToastStore();
  const isArtworkBusy = ["compress", "upload", "confirm"].includes(phase);
  const isBusy = isArtworkBusy || isImportingTranslation;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      void preparedRef.current?.dispose().catch((error: unknown) => {
        console.error("清理嵌稿临时文件失败", error); // eslint-disable-line no-console
      });
    };
  }, []);

  async function start() {
    if (controllerRef.current || files.length === 0) {return;}
    const abort = new AbortController();
    controllerRef.current = abort;
    try {
      if (!preparedRef.current) {
        setPhase("compress");
        setProgress(0);
        const archive = await prepareArtwork(files, abort.signal, (value) => {
          const ratio = value.processedBytes / Math.max(totalSize, 1);
          setProgress(Math.min(45, ratio * 45));
        });
        if (abort.signal.aborted) {
          await archive.dispose();
          abort.signal.throwIfAborted();
        }
        preparedRef.current = archive;
      }
      const archive = preparedRef.current;
      if (uploadedVersionRef.current === null) {
        setPhase("upload");
        setProgress(50);
        const allocation = await allocArtwork(chapterId, archive.hash, archive.file.size);
        abort.signal.throwIfAborted();
        if (!allocation.success) {throw toApiRequestError(allocation);}
        if (allocation.data.slot) {
          const result = await uploadToPresignedUrl(
            allocation.data.slot.putUrl,
            archive.file,
            allocation.data.slot.headers,
            (value) => { setProgress(50 + value * 0.48); },
            abort.signal,
          );
          abort.signal.throwIfAborted();
          if (!result.success) {throw toApiRequestError(result);}
        }
        uploadedVersionRef.current = allocation.data.artworkVersion;
      }
      abort.signal.throwIfAborted();
      setPhase("confirm");
      setProgress(98);
      const confirmation = await markArtworkUploaded(chapterId, uploadedVersionRef.current);
      if (!confirmation.success) {throw toApiRequestError(confirmation);}
      setProgress(100);
      setPhase("done");
      showToast("嵌稿上传成功", "success");
      onArtworkUploaded();
    } catch (error) {
      if (abort.signal.aborted) {
        setPhase("cancelled");
      } else {
        console.error("嵌稿上传失败", error); // eslint-disable-line no-console
        setPhase("error");
        showToast("嵌稿上传失败，请重试", "error");
      }
    } finally {
      controllerRef.current = null;
    }
  }

  function selectFiles() {
    artworkInputRef.current?.click();
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  const canSelect = !isArtworkBusy && phase !== "done";
  const isRetrying = phase === "error" || phase === "cancelled";

  return (
    <AppDialog
      title="上传数据"
      description={chapterLabel}
      size="default"
      onClose={onClose}
      locked={isBusy}
      showClose={!isBusy}
      closeOnBackdrop={false}
      footer={(
        <div className="flex gap-2">
          {activeTab === "artwork" && isArtworkBusy && (
            <AppDialogAction onClick={cancel} disabled={phase === "confirm"}>
              <X size={14} />
              取消
            </AppDialogAction>
          )}
          {activeTab === "artwork" && !isArtworkBusy && phase === "done" && (
            <AppDialogAction tone="brand" onClick={onClose}>
              <Check size={14} />
              完成
            </AppDialogAction>
          )}
          {activeTab === "artwork" && !isArtworkBusy && phase !== "done" && (
            <>
              <AppDialogAction onClick={onClose}>
                <X size={14} />
                关闭
              </AppDialogAction>
              <AppDialogAction
                tone="brand"
                disabled={files.length === 0}
                onClick={() => { void start(); }}
              >
                {isRetrying ? <RotateCcw size={14} /> : <CloudUpload size={14} />}
                {isRetrying ? "重试" : "上传"}
              </AppDialogAction>
            </>
          )}
          {activeTab === "translation" && !isImportingTranslation && (
            <AppDialogAction onClick={onClose}>
              <X size={14} />
              关闭
            </AppDialogAction>
          )}
          {activeTab === "translation" && isImportingTranslation && (
            <AppDialogAction disabled>
              <LoaderCircle size={14} className="animate-spin" />
              上传中
            </AppDialogAction>
          )}
        </div>
      )}
    >
      {canUploadTranslation && canUploadArtwork && (
        <div
          role="tablist"
          aria-label="上传数据类型"
          className="mb-4 flex rounded-lg bg-green-50 p-0.5"
        >
          {([
            ["translation", "译稿"],
            ["artwork", "嵌稿"],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`upload-${tab}-tab`}
              aria-controls={`upload-${tab}-panel`}
              aria-selected={activeTab === tab}
              disabled={isBusy}
              onClick={() => { setActiveTab(tab); }}
              className={clsx(
                "flex-1 rounded-md py-1.5 text-xs font-semibold",
                "transition-all duration-200 focus:outline-none disabled:cursor-default",
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-(--shadow-sm)"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {canUploadTranslation && (
        <div
          role="tabpanel"
          id="upload-translation-panel"
          aria-label={canUploadArtwork ? undefined : "译稿"}
          aria-labelledby={canUploadArtwork ? "upload-translation-tab" : undefined}
          aria-hidden={activeTab !== "translation"}
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "motion-reduce:transition-none",
            activeTab === "translation"
              ? "max-h-24 opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <input
            ref={translationInputRef}
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="hidden"
            aria-label="选择译稿"
            disabled={activeTab !== "translation" || isImportingTranslation}
            onChange={(event) => {
              if (!onImportTranslation) {return;}
              void onImportTranslation(event).then((isImported) => {
                if (isImported) {onClose();}
              });
            }}
          />
          <button
            type="button"
            disabled={activeTab !== "translation" || isImportingTranslation}
            onClick={() => { translationInputRef.current?.click(); }}
            className={clsx(
              "flex min-h-24 w-full items-center justify-center gap-3 rounded-lg",
              "border border-dashed border-stone-200 bg-stone-50/60 text-slate-400",
              "transition-colors hover:border-(--color-border-green-200) hover:bg-green-50",
              "disabled:cursor-default disabled:opacity-60",
            )}
          >
            {isImportingTranslation
              ? <LoaderCircle size={22} className="animate-spin text-green-500" />
              : <FileUp size={22} />}
            <span className="text-xs font-semibold">
              {isImportingTranslation ? "正在上传" : "选择译稿"}
            </span>
          </button>
        </div>
      )}

      {canUploadArtwork && (
        <div
          role="tabpanel"
          id="upload-artwork-panel"
          aria-label={canUploadTranslation ? undefined : "嵌稿"}
          aria-labelledby={canUploadTranslation ? "upload-artwork-tab" : undefined}
          aria-hidden={activeTab !== "artwork"}
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "motion-reduce:transition-none",
            activeTab === "artwork"
              ? "max-h-40 opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <input
            ref={artworkInputRef}
            type="file"
            multiple
            className="hidden"
            aria-label="选择嵌稿"
            disabled={activeTab !== "artwork"}
            onChange={(event) => {
              const selected = [...(event.target.files ?? [])];
              event.target.value = "";
              if (selected.length === 0) {return;}
              try {
                validateArtworkFiles(selected);
                const previous = preparedRef.current;
                preparedRef.current = null;
                uploadedVersionRef.current = null;
                void previous?.dispose().catch((error: unknown) => {
                  // eslint-disable-next-line no-console
                  console.error("清理嵌稿临时文件失败", error);
                });
                setFiles(selected);
                setProgress(0);
                setPhase("ready");
              } catch (error) {
                const message = error instanceof Error ? error.message : "文件选择无效";
                showToast(message, "error");
              }
            }}
          />

          <button
            type="button"
            onClick={selectFiles}
            disabled={!canSelect || activeTab !== "artwork"}
            aria-label={files.length > 0 ? "重新选择嵌稿" : "选择嵌稿"}
            className={clsx(
              "flex min-h-24 w-full items-center justify-center gap-3 rounded-lg",
              "border border-dashed transition-colors",
              isRetrying
                ? "border-(--color-border-red-200) bg-red-50 text-red-500"
                : "border-stone-200 bg-stone-50/60 text-slate-400",
              canSelect && "hover:border-(--color-border-green-200) hover:bg-green-50",
              !canSelect && "cursor-default",
            )}
          >
            {isArtworkBusy && (
              <LoaderCircle size={22} className="animate-spin text-green-500" />
            )}
            {!isArtworkBusy && isRetrying && (
              <CircleAlert size={22} />
            )}
            {!isArtworkBusy && !isRetrying && files.length > 0 && (
              <FileStack size={22} />
            )}
            {!isArtworkBusy && !isRetrying && files.length === 0 && (
              <FileUp size={22} />
            )}
            {files.length > 0 && !isArtworkBusy && (
              <span className="text-xs font-semibold tabular-nums">
                {files.length} · {formatSize(totalSize)}
              </span>
            )}
          </button>

          {isArtworkBusy && (
            <div className="mt-4 flex items-center gap-3">
              <CloudUpload size={15} className="shrink-0 text-green-500" />
              <div
                role="progressbar"
                aria-label="上传进度"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-green-50"
              >
                <div
                  className="h-full rounded-full bg-(--color-green-500) transition-[width]"
                  style={{ width: `${String(progress)}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-slate-400">
                {Math.round(progress)}%
              </span>
            </div>
          )}

          {phase === "done" && (
            <span className="sr-only" role="status">上传完成</span>
          )}
        </div>
      )}
    </AppDialog>
  );
}
