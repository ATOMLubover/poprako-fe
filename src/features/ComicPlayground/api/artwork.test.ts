import { afterEach, expect, test, vi } from "vitest";
import { api } from "@/api/util";
import { allocArtwork, exportArtwork, markArtworkUploaded } from "./artwork";

afterEach(() => { vi.restoreAllMocks(); });

test("preserves version on a deduplication hit so it can still be confirmed", async () => {
  const post = vi.spyOn(api, "post").mockResolvedValue({
    success: true, data: { artwork_version: 7, slot: null },
  });
  const result = await allocArtwork("chapter", "hash", 123);
  expect(post).toHaveBeenCalledWith("/chapters/chapter/artwork/alloc", {
    artwork_hash: "hash", new_byte_len: 123, ext: "xz",
  });
  expect(result).toEqual({ success: true, data: { artworkVersion: 7, slot: null } });
  await markArtworkUploaded("chapter", 7);
  expect(post).toHaveBeenLastCalledWith("/chapters/chapter/artwork/mark-uploaded", {
    artwork_version: 7,
  });
});

test("unwraps upload capability and preserves signed headers", async () => {
  vi.spyOn(api, "post").mockResolvedValue({ success: true, data: {
    artwork_version: 8,
    slot: { put_url: "https://storage.example/put", headers: { "content-length": "123" } },
  } });
  expect(await allocArtwork("chapter", "hash", 123)).toEqual({ success: true, data: {
    artworkVersion: 8,
    slot: { putUrl: "https://storage.example/put", headers: { "content-length": "123" } },
  } });
});

test("unwraps the artwork export URL and metadata", async () => {
  const get = vi.spyOn(api, "get").mockResolvedValue({ success: true, data: {
    artwork_version: 9,
    artwork_hash: "hash",
    ext: "xz",
    download_url: "https://storage.example/artwork",
  } });

  expect(await exportArtwork("chapter")).toEqual({ success: true, data: {
    artworkVersion: 9,
    artworkHash: "hash",
    extension: "xz",
    downloadUrl: "https://storage.example/artwork",
  } });
  expect(get).toHaveBeenCalledWith("/chapters/chapter/artwork/export");
});
