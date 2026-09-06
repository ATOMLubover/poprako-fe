import { useEffect, useRef, useState } from "react";
import { Check, FileUp, LoaderCircle } from "lucide-react";
import clsx from "clsx";
import AppDialog, { AppDialogAction } from "@/components/ui/AppDialog";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { toApiRequestError } from "@/api/util";
import { allocArtwork, markArtworkUploaded } from "@/features/ComicPlayground/api/artwork";
import { uploadToPresignedUrl } from "@/features/ComicPlayground/api/page";
import { prepareArtwork, validateArtworkFiles, type PreparedArtwork } from "../../artworkUpload";

interface Props {
  chapterId: string;
  chapterLabel: string;
  onUploaded: () => void;
  onClose: () => void;
}
type Phase = "ready" | "compress" | "upload" | "confirm" | "done" | "error" | "cancelled";

function formatSize(bytes: number) {
  return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
}

export default function ArtworkUploadDialog({
  chapterId, chapterLabel, onUploaded, onClose,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const [detail, setDetail] = useState("选择本章节的全部嵌稿文件，可多选 PSD、PSB 等格式。");
  const [isConfirmRetry, setIsConfirmRetry] = useState(false);
  const [archiveSize, setArchiveSize] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const preparedRef = useRef<PreparedArtwork | null>(null);
  const uploadedVersionRef = useRef<number | null>(null);
  const { showToast } = useToastStore();
  const isBusy = ["compress", "upload", "confirm"].includes(phase);
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
    if (controllerRef.current) {return;}
    const abort = new AbortController();
    controllerRef.current = abort;
    try {
      if (!preparedRef.current) {
        setPhase("compress");
        setProgress(0);
        setDetail("正在压缩首个文件，大型 PSD 可能需要较长时间，请保留此页面。");
        const archive = await prepareArtwork(files, abort.signal, (value) => {
          setProgress(Math.min(99, value.processedBytes / Math.max(totalSize, 1) * 100));
          setDetail(`已处理 ${String(value.completedFiles)} / ${String(files.length)} 个文件`);
        });
        if (abort.signal.aborted) {
          await archive.dispose();
          abort.signal.throwIfAborted();
        }
        preparedRef.current = archive;
        setArchiveSize(archive.file.size);
      }
      const archive = preparedRef.current;
      if (uploadedVersionRef.current === null) {
        setPhase("upload");
        setProgress(0);
        setDetail("压缩完成，正在申请上传地址…");
        const allocation = await allocArtwork(chapterId, archive.hash, archive.file.size);
        abort.signal.throwIfAborted();
        if (!allocation.success) {throw toApiRequestError(allocation);}
        if (allocation.data.slot) {
          setDetail("正在上传压缩后的嵌稿，请保留此页面。");
          const result = await uploadToPresignedUrl(
            allocation.data.slot.putUrl,
            archive.file,
            allocation.data.slot.headers,
            setProgress,
            abort.signal,
          );
          abort.signal.throwIfAborted();
          if (!result.success) {throw toApiRequestError(result);}
        }
        uploadedVersionRef.current = allocation.data.artworkVersion;
        setIsConfirmRetry(true);
      }
      abort.signal.throwIfAborted();
      setPhase("confirm");
      setProgress(100);
      setDetail("文件已传输完成，正在确认版本并更新嵌字流程…");
      const confirmation = await markArtworkUploaded(chapterId, uploadedVersionRef.current);
      if (!confirmation.success) {throw toApiRequestError(confirmation);}
      setPhase("done");
      setDetail("嵌稿上传成功，嵌字流程已完成。");
      showToast("嵌稿上传成功", "success");
      onUploaded();
    } catch (error) {
      if (abort.signal.aborted) {
        setPhase("cancelled");
        setDetail("已取消。尚未确认本次上传；可重新开始。");
      } else {
        console.error("嵌稿上传失败", error); // eslint-disable-line no-console
        const message = error instanceof Error ? error.message : "嵌稿上传失败";
        setPhase("error");
        setDetail(message);
        showToast(message, "error");
      }
    } finally {
      controllerRef.current = null;
    }
  }

  function cancel() {
    controllerRef.current?.abort();
    setDetail("正在取消，请稍候…");
  }

  return (
    <AppDialog
      title="上传嵌稿"
      description={chapterLabel}
      size="large"
      onClose={onClose}
      locked={isBusy}
      showClose={!isBusy}
      closeOnBackdrop={false}
      footer={(
        <div className="flex gap-2">
          {isBusy ? (
            <AppDialogAction onClick={cancel} disabled={phase === "confirm"}>
              {phase === "confirm" ? "正在确认上传" : "取消任务"}
            </AppDialogAction>
          ) : (
            <>
              <AppDialogAction onClick={onClose}>
                {phase === "done" ? "完成" : "关闭"}
              </AppDialogAction>
              {phase !== "done" && (
                <AppDialogAction
                  tone="brand"
                  disabled={files.length === 0}
                  onClick={() => { void start(); }}
                >
                  {phase === "error" || phase === "cancelled"
                    ? (isConfirmRetry ? "重试确认" : "重试")
                    : "压缩并上传"}
                </AppDialogAction>
              )}
            </>
          )}
        </div>
      )}
    >
      <div className="space-y-4 text-xs text-slate-500">
        <ol className="flex gap-3 border-b border-stone-200 pb-3" aria-label="上传步骤">
          {(["compress", "upload", "confirm"] as const).map((step, index) => (
            <li key={step} className={clsx(
              "flex flex-1 items-center gap-1.5",
              phase === step && "font-semibold text-green-600",
            )} aria-current={phase === step ? "step" : undefined}>
              {phase === "done" ? <Check size={14} /> : <span>{index + 1}.</span>}
              {["压缩文件", "上传嵌稿", "确认完成"][index]}
            </li>
          ))}
        </ol>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          aria-label="选择嵌稿文件"
          onChange={(event) => {
            const selected = [...(event.target.files ?? [])];
            event.target.value = "";
            if (selected.length === 0) {return;}
            try {
              validateArtworkFiles(selected);
              const previous = preparedRef.current;
              preparedRef.current = null;
              uploadedVersionRef.current = null;
              setIsConfirmRetry(false);
              setArchiveSize(null);
              void previous?.dispose().catch((error: unknown) => {
                console.error("清理嵌稿临时文件失败", error); // eslint-disable-line no-console
              });
              setFiles(selected);
              setPhase("ready");
              setDetail("文件已就绪，确认后开始压缩并上传。");
            } catch (error) {
              setDetail(error instanceof Error ? error.message : "文件选择无效");
            }
          }}
        />
        {!isBusy && phase !== "done" && (
          <AppDialogAction onClick={() => inputRef.current?.click()}>
            <FileUp size={15} />{files.length > 0 ? "重新选择文件" : "选择嵌稿文件"}
          </AppDialogAction>
        )}
        {files.length > 0 && (
          <div>
            <div className="mb-2 flex justify-between font-medium text-slate-600">
              <span>{files.length} 个文件 · {formatSize(totalSize)}</span>
              {archiveSize !== null && <span>压缩后 {formatSize(archiveSize)}</span>}
            </div>
            <ul className="max-h-32 overflow-y-auto divide-y divide-stone-100">
              {files.map((file) => (
                <li key={file.name} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate" title={file.name}>{file.name}</span>
                  <span className="shrink-0 tabular-nums">{formatSize(file.size)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {isBusy && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <LoaderCircle size={14} className="animate-spin" />
              <span>{phase === "compress" ? "压缩" : "上传"}进度</span>
              <span className="ml-auto tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div role="progressbar" aria-label="当前步骤进度" aria-valuenow={Math.round(progress)}
              aria-valuemin={0} aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-green-50">
              <div className="h-full bg-green-500 transition-[width]"
                style={{ width: `${String(progress)}%` }} />
            </div>
          </div>
        )}
        <p role="status" className={clsx(
          "leading-relaxed", phase === "error" && "text-red-500",
          phase === "done" && "text-green-600",
        )}>{detail}</p>
        {phase === "ready" && (
          <p className="border-t border-stone-200 pt-3 text-[11px] leading-relaxed">
            请一次选齐本章节的全部嵌稿。本次上传会替换已有嵌稿，确认成功后自动完成嵌字流程。
            文件将先在本机压缩，再上传；服务端默认压缩包上限为 512 MiB。
          </p>
        )}
      </div>
    </AppDialog>
  );
}
