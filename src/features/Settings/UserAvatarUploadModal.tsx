import { useEffect, useRef, useState } from "react";
import { Upload, User as UserIcon } from "lucide-react";
import clsx from "clsx";
import AppDialog, { AppDialogAction } from "@/components/ui/AppDialog";
import { confirmUserAvatarUploaded, reserveUserAvatarUpload } from "@/api/user";
import { showLocalApiFailure, showLocalCaughtError } from "@/api/util";
import { uploadToPresignedUrl } from "@/features/ComicPlayground/api/page";
import { hashPageFile } from "@/features/ComicPlayground/features/ComicDetailModal/pageHash";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { useRefreshLoginState } from "@/hooks/useRefreshLoginState";
import type { UserInfo } from "@/types/user";

type Props = {
  user: UserInfo;
  onClose: () => void;
};

const ACCEPTED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "avif",
]);

export default function UserAvatarUploadModal({ user, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToastStore();
  const refreshLoginState = useRefreshLoginState();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const resolvedAvatarUrl =
    localAvatarUrl ??
    (user.avatarThumbnailUrl || user.avatarUrl
      ? user.avatarThumbnailUrl || user.avatarUrl
      : "");

  useEffect(() => {
    return () => {
      if (localAvatarUrl) {
        URL.revokeObjectURL(localAvatarUrl);
      }
    };
  }, [localAvatarUrl]);

  useEffect(() => {
    if (!isUploading) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  const handleRequestClose = () => {
    if (isUploading) {
      setShowExitWarning(true);
      return;
    }
    onClose();
  };

  const handleSelectFile = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (file?: File) => {
    if (!file || isUploading) return;

    const fileNameParts = file.name.split(".");
    const extension = (fileNameParts[fileNameParts.length - 1] || "").toLowerCase();

    if (!extension || !ACCEPTED_EXTENSIONS.has(extension) || !file.type.startsWith("image/")) {
      showToast("请上传有效的图片文件", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { imageHash } = await hashPageFile(file);
      const reserveRes = await reserveUserAvatarUpload(user.id, {
        imageHash,
        newByteLen: file.size,
        extension,
      });
      if (!reserveRes.success) {
        showLocalApiFailure(reserveRes, showToast);
        return;
      }

      const slot = reserveRes.data;
      if (slot === null) {
        showToast("头像图片未发生变化", "success");
        return;
      }

      const uploadRes = await uploadToPresignedUrl(
        slot.putUrl,
        file,
        slot.headers,
        (percent) => setUploadProgress(percent),
      );
      if (!uploadRes.success) {
        showLocalApiFailure(uploadRes, showToast);
        return;
      }

      const confirmRes = await confirmUserAvatarUploaded(
        user.id,
        slot.imageVersion,
      );
      if (!confirmRes.success) {
        showLocalApiFailure(confirmRes, showToast);
        return;
      }

      setLocalAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });

      const refreshRes = await refreshLoginState();
      if (!refreshRes.success) {
        showLocalApiFailure(refreshRes, showToast);
      }

      showToast("头像上传成功", "success");
    } catch (err) {
      console.error("[UserAvatarUploadModal] 上传头像异常:", err);
      showLocalCaughtError(err, showToast, "头像上传失败", true);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <>
      <AppDialog
        title="上传头像"
        description="仅可上传你自己的头像。上传完成前请勿关闭弹窗。"
        size="default"
        onClose={handleRequestClose}
        closeOnEscape={false}
        footer={(
          <div className="flex">
            <AppDialogAction onClick={handleRequestClose}>
              关闭
            </AppDialogAction>
          </div>
        )}
      >
        <div className="flex items-center justify-center py-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void handleAvatarFile(file);
            }}
          />

          <button
            type="button"
            onClick={handleSelectFile}
            disabled={isUploading}
            className={clsx(
              "group/avatar relative size-28 overflow-hidden rounded-full",
              "border border-slate-200 bg-slate-100 transition-all",
              isUploading
                ? "cursor-progress"
                : "cursor-pointer hover:shadow-sm active:scale-[0.99]",
            )}
          >
            {resolvedAvatarUrl ? (
              <img
                src={resolvedAvatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <UserIcon size={30} />
              </div>
            )}

            <div
              className={clsx(
                "absolute inset-0 transition-colors",
                isUploading
                  ? "bg-black/45"
                  : "bg-black/0 group-hover/avatar:bg-black/18",
              )}
            />

            {!isUploading && (
              <div
                className={clsx(
                  "absolute inset-0 flex items-center justify-center",
                  "opacity-0 transition-opacity group-hover/avatar:opacity-100",
                )}
              >
                <Upload className="size-5 text-white" strokeWidth={2.5} />
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white/95">
                  {uploadProgress !== null && uploadProgress < 100
                    ? `${uploadProgress}%`
                    : "..."}
                </span>
              </div>
            )}
          </button>
        </div>
      </AppDialog>

      {showExitWarning && (
        <ConfirmDialog
          title="头像上传尚未完成"
          description={
            "当前正在上传并记录头像。现在退出可能导致未完成确认，请继续等待或确认退出。"
          }
          confirmLabel="确认退出"
          cancelLabel="继续等待"
          onConfirm={() => {
            setShowExitWarning(false);
            onClose();
          }}
          onCancel={() => setShowExitWarning(false)}
        />
      )}
    </>
  );
}
