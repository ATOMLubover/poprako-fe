import { afterEach, describe, expect, test, vi } from "vitest";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { uploadToPresignedUrl } from "./page";

class MockXmlHttpRequest {
  status = 422;
  responseText = JSON.stringify({ message: "对象存储校验消息" });
  timeout = 0;
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  open(): void {}

  setRequestHeader(): void {}

  send(): void {
    this.onload?.();
  }

  abort(): void {
    this.onabort?.();
  }
}

describe("page upload API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    useToastStore.getState().hideToast();
  });

  test("reports a presigned PUT 422 response message", async () => {
    vi.stubGlobal("XMLHttpRequest", MockXmlHttpRequest);
    const showToast = vi.spyOn(useToastStore.getState(), "showToast");

    const result = await uploadToPresignedUrl(
      "https://upload.example/image",
      new File(["image"], "image.png", { type: "image/png" }),
    );

    expect(result).toEqual({
      success: false,
      error: "对象存储校验消息",
      httpStatus: 422,
      failureKind: "http",
    });
    expect(showToast).toHaveBeenCalledOnce();
    expect(showToast).toHaveBeenCalledWith("对象存储校验消息", "error");
  });
});
