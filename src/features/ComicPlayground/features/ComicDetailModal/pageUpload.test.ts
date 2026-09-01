import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  listPages: vi.fn(),
  allocChapterPages: vi.fn(),
  allocExistingPageUpload: vi.fn(),
  updatePage: vi.fn(),
  uploadToPresignedUrl: vi.fn(),
}));

const hashMocks = vi.hoisted(() => ({
  hashPageFile: vi.fn(),
}));

function noop(): void {return;}

vi.mock("@/features/ComicPlayground/api/page", () => apiMocks);
vi.mock("./pageHash", () => hashMocks);

import {
  cancelAllPageUploads,
  startChapterPageUpload,
  startPageReupload,
} from "./pageUpload";
import { getPageUploadTaskState } from "./pageUploadStore";

function file(name: string, byte = 1): File {
  return new File([new Uint8Array([byte])], name, { type: "image/png" });
}

function slot(pageId: string, imageVersion = 1) {
  return {
    pageId,
    index: Number(pageId.replaceAll(/\D/g, "")) || 0,
    imageHash: `hash-${pageId}`,
    extension: "png",
    slot: {
      putUrl: `https://upload.example/${pageId}/${String(imageVersion)}`,
      imageVersion,
      headers: {},
    },
  };
}

describe("page upload coordinator", () => {
  beforeEach(() => {
    cancelAllPageUploads();
    vi.clearAllMocks();
    apiMocks.listPages.mockResolvedValue({ success: true, data: [] });
    apiMocks.updatePage.mockResolvedValue({ success: true, data: undefined });
    apiMocks.uploadToPresignedUrl.mockResolvedValue({
      success: true,
      data: undefined,
      httpStatus: 200,
    });
  });

  afterEach(() => {
    cancelAllPageUploads();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("allocates the full manifest without reading existing image bytes", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    apiMocks.listPages.mockResolvedValue({
      success: true,
      data: [
        {
          id: "page-existing",
          imageHash: "existing-hash",
          extension: "png",
          imageUrl: "",
        },
      ],
    });
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "new-hash" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: {
        pages: [
          {
            pageId: "page-existing",
            index: 0,
            imageHash: "existing-hash",
            extension: "png",
            slot: null,
          },
          {
            ...slot("page-1"),
            imageHash: "new-hash",
            index: 1,
          },
        ],
      },
    });

    const started = await startChapterPageUpload("chapter-1", [file("001.png")]);
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 1,
      failed: 0,
      reportedValidationFailures: 0,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(apiMocks.allocChapterPages).toHaveBeenCalledWith({
      chapterId: "chapter-1",
      pages: [
        {
          pageId: "page-existing",
          imageHash: "existing-hash",
          extension: "png",
        },
        {
          imageHash: "new-hash",
          newByteLen: 1,
          extension: "png",
        },
      ],
    });
  });

  test("sends oversized files to backend validation instead of rejecting locally", async () => {
    const oversizedFile = file("oversized.png");
    const oversizedByteLength = 21 * 1024 * 1024;
    Object.defineProperty(oversizedFile, "size", { value: oversizedByteLength });
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "oversized-hash" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: {
        pages: [{
          ...slot("page-1"),
          imageHash: "oversized-hash",
          slot: null,
        }],
      },
    });

    await startChapterPageUpload("chapter-1", [oversizedFile]);

    expect(apiMocks.allocChapterPages).toHaveBeenCalledWith({
      chapterId: "chapter-1",
      pages: [{
        imageHash: "oversized-hash",
        newByteLen: oversizedByteLength,
        extension: "png",
      }],
    });
  });

  test("marks backend 422 failures as already reported", async () => {
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "page-hash" });
    apiMocks.allocExistingPageUpload.mockResolvedValue({
      success: false,
      error: "后端文件大小限制",
      httpStatus: 422,
    });

    const started = await startPageReupload(
      "chapter-1",
      "page-1",
      file("001.png"),
    );

    await expect(started.completion).resolves.toEqual({
      succeeded: 0,
      failed: 1,
      reportedValidationFailures: 1,
    });
  });

  test("re-allocates a matching pending page instead of skipping it as a duplicate", async () => {
    apiMocks.listPages.mockResolvedValue({
      success: true,
      data: [
        {
          id: "page-pending",
          imageHash: "pending-hash",
          extension: "png",
          imageUrl: "",
          isUploaded: false,
        },
      ],
    });
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "pending-hash" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: {
        pages: [
          {
            ...slot("page-pending", 2),
            imageHash: "pending-hash",
          },
        ],
      },
    });

    const started = await startChapterPageUpload("chapter-1", [file("001.png")]);
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 1,
      failed: 0,
      reportedValidationFailures: 0,
    });
    expect(apiMocks.allocChapterPages).toHaveBeenCalledWith({
      chapterId: "chapter-1",
      pages: [
        {
          pageId: "page-pending",
          imageHash: "pending-hash",
          newByteLen: 1,
          extension: "png",
        },
      ],
    });
    expect(apiMocks.uploadToPresignedUrl).toHaveBeenCalledWith(
      "https://upload.example/page-pending/2",
      expect.any(File),
      {},
      expect.any(Function),
      expect.any(AbortSignal),
    );
  });

  test("refreshes a slotless page through the completed page task", async () => {
    apiMocks.listPages.mockResolvedValue({
      success: true,
      data: [
        {
          id: "page-uploaded",
          imageHash: "uploaded-hash",
          extension: "png",
          imageUrl: "https://cdn.example/page-uploaded.png",
          isUploaded: true,
        },
      ],
    });
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "uploaded-hash" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: {
        pages: [
          {
            ...slot("page-uploaded"),
            imageHash: "uploaded-hash",
            slot: null,
          },
        ],
      },
    });

    const started = await startChapterPageUpload("chapter-1", [file("001.png")]);
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 0,
      failed: 0,
      reportedValidationFailures: 0,
    });
    expect(apiMocks.allocChapterPages).toHaveBeenCalledWith({
      chapterId: "chapter-1",
      pages: [
        {
          pageId: "page-uploaded",
          imageHash: "uploaded-hash",
          newByteLen: 1,
          extension: "png",
        },
      ],
    });
    expect(apiMocks.uploadToPresignedUrl).not.toHaveBeenCalled();
    expect(Object.values(getPageUploadTaskState().tasks)).toContainEqual(
      expect.objectContaining({
        pageId: "page-uploaded",
        index: 0,
        status: "succeeded",
        progress: 100,
        error: null,
      }),
    );
  });

  test("continues other page tasks after one deterministic PUT failure", async () => {
    const files = [file("001.png", 1), file("002.png", 2), file("003.png", 3)];
    hashMocks.hashPageFile
      .mockResolvedValueOnce({ imageHash: "hash-page-1" })
      .mockResolvedValueOnce({ imageHash: "hash-page-2" })
      .mockResolvedValueOnce({ imageHash: "hash-page-3" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: {
        pages: [slot("page-1"), slot("page-2"), slot("page-3")],
      },
    });
    apiMocks.uploadToPresignedUrl.mockImplementation((putUrl: string) => {
      if (putUrl.includes("page-1")) {
        return {
          success: false,
          error: "上传失败: HTTP 400",
          httpStatus: 400,
          failureKind: "http",
        };
      }
      return { success: true, data: undefined, httpStatus: 200 };
    });

    const started = await startChapterPageUpload("chapter-1", files);
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 2,
      failed: 1,
      reportedValidationFailures: 0,
    });
    expect(apiMocks.uploadToPresignedUrl).toHaveBeenCalledTimes(3);
    expect(apiMocks.allocExistingPageUpload).not.toHaveBeenCalled();
    expect(apiMocks.updatePage).toHaveBeenCalledTimes(2);
    expect(apiMocks.updatePage).toHaveBeenCalledWith("page-2", {
      isUploaded: true,
      imageVersion: 1,
    });
    expect(apiMocks.updatePage).toHaveBeenCalledWith("page-3", {
      isUploaded: true,
      imageVersion: 1,
    });
    expect(
      Object.values(getPageUploadTaskState().tasks).some(
        (task) => task.pageId === "page-1" && task.status === "failed",
      ),
    ).toBe(true);
  });

  test("re-allocates and retries recoverable PUT failures twice", async () => {
    vi.useFakeTimers();
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "hash-page-1" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: { pages: [slot("page-1")] },
    });
    apiMocks.uploadToPresignedUrl
      .mockResolvedValueOnce({
        success: false,
        error: "上传失败: HTTP 500",
        httpStatus: 500,
        failureKind: "http",
      })
      .mockResolvedValueOnce({
        success: false,
        error: "上传超时",
        failureKind: "timeout",
      })
      .mockResolvedValueOnce({
        success: true,
        data: undefined,
        httpStatus: 200,
      });
    apiMocks.allocExistingPageUpload
      .mockResolvedValueOnce({ success: true, data: slot("page-1", 1) })
      .mockResolvedValueOnce({ success: true, data: slot("page-1", 1) });

    const started = await startChapterPageUpload("chapter-1", [file("001.png")]);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 1,
      failed: 0,
      reportedValidationFailures: 0,
    });
    expect(apiMocks.uploadToPresignedUrl).toHaveBeenCalledTimes(3);
    expect(apiMocks.allocExistingPageUpload).toHaveBeenCalledTimes(2);
    expect(apiMocks.allocExistingPageUpload).toHaveBeenCalledWith({
      pageId: "page-1",
      imageHash: "hash-page-1",
      newByteLen: 1,
      extension: "png",
    });
    expect(apiMocks.updatePage).toHaveBeenCalledTimes(1);
  });

  test("owns mark-uploaded retries after the caller releases the task", async () => {
    vi.useFakeTimers();
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "hash-page-1" });
    apiMocks.allocChapterPages.mockResolvedValue({
      success: true,
      data: { pages: [slot("page-1")] },
    });
    apiMocks.updatePage
      .mockResolvedValueOnce({ success: false, error: "temporary failure" })
      .mockRejectedValueOnce(new Error("network failure"))
      .mockResolvedValueOnce({ success: true, data: undefined });

    const started = await startChapterPageUpload("chapter-1", [file("001.png")]);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 1,
      failed: 0,
      reportedValidationFailures: 0,
    });
    expect(apiMocks.updatePage).toHaveBeenCalledTimes(3);
    expect(
      Object.values(getPageUploadTaskState().tasks).some(
        (task) => task.pageId === "page-1" && task.status === "succeeded",
      ),
    ).toBe(true);
  });

  test("treats a null reupload slot as an already accepted identity", async () => {
    hashMocks.hashPageFile.mockResolvedValue({ imageHash: "hash-page-1" });
    apiMocks.allocExistingPageUpload.mockResolvedValue({
      success: true,
      data: {
        ...slot("page-1"),
        slot: null,
      },
    });

    const started = await startPageReupload(
      "chapter-1",
      "page-1",
      file("001.png"),
    );
    const summary = await started.completion;

    expect(summary).toEqual({
      succeeded: 1,
      failed: 0,
      reportedValidationFailures: 0,
    });
    expect(apiMocks.uploadToPresignedUrl).not.toHaveBeenCalled();
    expect(apiMocks.updatePage).not.toHaveBeenCalled();
  });

  test("keeps alloc, PUT, and mark serial for the same page", async () => {
    const events: string[] = [];
    let finishFirstPut: () => void = noop;
    const firstPut = new Promise<{
      success: true;
      data: undefined;
      httpStatus: number;
    }>((resolve) => {
      finishFirstPut = () => { resolve({
        success: true,
        data: undefined,
        httpStatus: 200,
      }); };
    });
    hashMocks.hashPageFile
      .mockResolvedValueOnce({ imageHash: "hash-a" })
      .mockResolvedValueOnce({ imageHash: "hash-b" });
    apiMocks.allocExistingPageUpload
      .mockImplementationOnce(() => {
        events.push("alloc-a");
        return { success: true, data: slot("page-1", 1) };
      })
      .mockImplementationOnce(() => {
        events.push("alloc-b");
        return { success: true, data: slot("page-1", 2) };
      });
    apiMocks.uploadToPresignedUrl
      .mockImplementationOnce(() => {
        events.push("put-a");
        return firstPut;
      })
      .mockImplementationOnce(() => {
        events.push("put-b");
        return { success: true, data: undefined, httpStatus: 200 };
      });
    apiMocks.updatePage.mockImplementation((_pageId: string, args: { imageVersion?: number }) => {
      events.push(`mark-${String(args.imageVersion)}`);
      return { success: true, data: undefined };
    });

    const first = await startPageReupload("chapter-1", "page-1", file("a.png"));
    await vi.waitFor(() => { expect(events).toEqual(["alloc-a", "put-a"]); });

    const second = await startPageReupload("chapter-1", "page-1", file("b.png"));
    expect(events).toEqual(["alloc-a", "put-a"]);

    finishFirstPut();
    await first.completion;
    await second.completion;

    expect(events).toEqual([
      "alloc-a",
      "put-a",
      "mark-1",
      "alloc-b",
      "put-b",
      "mark-2",
    ]);
  });
});
