import { useState } from "react";
import clsx from "clsx";
import {
  Download,
  FileArchive,
  Image as ImageIcon,
  Images,
} from "lucide-react";
import { Switch } from "radix-ui";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingCircle from "@/components/ui/LoadingCircle";

type DownloadTab = "translation" | "artwork";

interface DownloadTranslationOptions {
  isIncludeImages: boolean;
  isUsingRawIdent: boolean;
}

interface Props {
  isDownloadingArtwork: boolean;
  onDownloadTranslation: (options: DownloadTranslationOptions) => void;
  onDownloadArtwork: () => void;
  onClose: () => void;
}

export default function DownloadDataDialog({
  isDownloadingArtwork,
  onDownloadTranslation,
  onDownloadArtwork,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<DownloadTab>("translation");
  const [useRawImageNames, setUseRawImageNames] = useState(false);

  return (
    <ConfirmDialog title="下载数据" hideFooter onCancel={onClose}>
      <div className="px-5 pb-5 pt-1">
        <div
          role="tablist"
          aria-label="下载数据类型"
          className="mb-4 flex rounded-lg bg-green-50 p-0.5"
        >
          {(
            [
              ["translation", "译稿"],
              ["artwork", "嵌稿"],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`download-${tab}-panel`}
              id={`download-${tab}-tab`}
              onClick={() => {
                setActiveTab(tab);
              }}
              className={clsx(
                "flex-1 rounded-md py-1.5 text-xs font-semibold",
                "transition-all duration-200 focus:outline-none",
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-(--shadow-sm)"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id="download-translation-panel"
          aria-labelledby="download-translation-tab"
          aria-hidden={activeTab !== "translation"}
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "motion-reduce:transition-none",
            activeTab === "translation"
              ? "max-h-20 opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <div
            className={clsx(
              "mb-3 flex h-8 items-center gap-2 rounded-lg px-2",
              "text-xs font-medium text-slate-500 hover:bg-slate-50",
            )}
          >
            <ImageIcon size={14} className="text-slate-400" />
            <label
              htmlFor="export-raw-image-names"
              className="flex-1 cursor-pointer"
            >
              使用原始图片名
            </label>
            <Switch.Root
              id="export-raw-image-names"
              checked={useRawImageNames}
              onCheckedChange={setUseRawImageNames}
              disabled={activeTab !== "translation"}
              className={clsx(
                "relative h-4.5 w-8 rounded-full bg-slate-200 transition-colors",
                "data-[state=checked]:bg-(--primary)",
              )}
            >
              <Switch.Thumb
                className={clsx(
                  "block size-3.5 translate-x-0.5 rounded-full bg-white shadow-sm",
                  "transition-transform data-[state=checked]:translate-x-4",
                )}
              />
            </Switch.Root>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeTab !== "translation"}
              onClick={() => {
                onDownloadTranslation({
                  isIncludeImages: false,
                  isUsingRawIdent: useRawImageNames,
                });
              }}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1 rounded-lg py-2",
                "border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500",
                "transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]",
              )}
            >
              <FileArchive size={14} />
              仅翻校数据
            </button>
            <button
              type="button"
              disabled={activeTab !== "translation"}
              onClick={() => {
                onDownloadTranslation({
                  isIncludeImages: true,
                  isUsingRawIdent: useRawImageNames,
                });
              }}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1 rounded-lg py-2",
                "border border-green-200 bg-green-50 text-xs font-semibold text-green-600",
                "transition-all duration-200 hover:bg-green-100 active:scale-[0.98]",
              )}
            >
              <Images size={14} />
              包含图源
            </button>
          </div>
        </div>
        <div
          role="tabpanel"
          id="download-artwork-panel"
          aria-labelledby="download-artwork-tab"
          aria-hidden={activeTab !== "artwork"}
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "motion-reduce:transition-none",
            activeTab === "artwork"
              ? "max-h-9 opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <button
            type="button"
            onClick={onDownloadArtwork}
            disabled={activeTab !== "artwork" || isDownloadingArtwork}
            className={clsx(
              "flex w-full items-center justify-center gap-1.5 rounded-lg py-2",
              "border border-green-200 bg-green-50 text-xs font-semibold text-green-600",
              "transition-all duration-200 hover:bg-green-100 active:scale-[0.98]",
              "disabled:pointer-events-none disabled:opacity-60",
            )}
          >
            {isDownloadingArtwork ? (
              <LoadingCircle size={14} />
            ) : (
              <Download size={14} />
            )}
            下载嵌稿
          </button>
        </div>
      </div>
    </ConfirmDialog>
  );
}
