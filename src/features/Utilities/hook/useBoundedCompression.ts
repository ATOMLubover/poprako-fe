import { useEffect, useRef, useState } from "react";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import type { ArchiveResult } from "../archive";
import { prepareBoundedArchive } from "../boundedCompression";
import { imageLimit, limitBytes, sortImages, validateImages } from "../boundedImages";
import type { BoundedImage } from "../boundedImages";

export default function useBoundedCompression() {
  const [items, setItems] = useState<BoundedImage[]>([]);
  const [body, setBody] = useState("1024");
  const [cover, setCover] = useState("512");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ArchiveResult | null>(null);
  const resultRef = useRef<ArchiveResult | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  function disposeResult() {
    const previous = resultRef.current;
    resultRef.current = null;
    void previous?.dispose().catch((error: unknown) => {
      console.error("清理定界压缩临时文件失败", error); // eslint-disable-line no-console
    });
  }

  useEffect(() => () => {
    controllerRef.current?.abort();
    disposeResult();
  }, []);

  function invalidate() {
    disposeResult();
    setResult(null);
    setStatus("");
    setCompleted(0);
  }

  function updateItems(next: BoundedImage[]) {
    if (controllerRef.current) { return; }
    invalidate();
    setItems(sortImages(next));
  }

  function addFiles(files: File[]) {
    if (controllerRef.current || files.length === 0) { return; }
    const next = [...items, ...files.map((file) => ({
      id: crypto.randomUUID(), file, limitKiB: null,
    }))];
    const error = validateImages(next);
    if (error) { showToast(error, "error"); return; }
    updateItems(next);
  }

  function changeDefault(kind: "body" | "cover", value: string) {
    if (controllerRef.current) { return; }
    invalidate();
    if (kind === "body") { setBody(value); } else { setCover(value); }
  }

  const isValid = items.length > 0 && limitBytes(body) !== null && limitBytes(cover) !== null
    && items.every((item, index) => limitBytes(imageLimit(item, index, body, cover)) !== null);

  async function start() {
    if (!isValid || controllerRef.current) { return; }
    const controller = new AbortController();
    controllerRef.current = controller;
    invalidate();
    setBusy(true);
    try {
      const archive = await prepareBoundedArchive(
        items, body, cover, controller.signal, setCompleted,
      );
      if (controller.signal.aborted) {
        await archive.dispose();
        controller.signal.throwIfAborted();
      }
      resultRef.current = archive;
      setResult(archive);
      setStatus("压缩完成，所有图片均已转换为 WebP 并符合上限");
    } catch (error) {
      if (controller.signal.aborted) { setStatus("已取消，可重新开始"); return; }
      const message = error instanceof Error ? error.message : "定界压缩失败，请重试";
      setStatus(message);
      showToast(message, "error");
      console.error("定界压缩失败", error); // eslint-disable-line no-console
    } finally {
      controllerRef.current = null;
      setBusy(false);
    }
  }

  function cancel() { controllerRef.current?.abort(); }

  return {
    items, body, cover, busy, completed, status, result, isValid,
    updateItems, addFiles, changeDefault, start, cancel,
  };
}
