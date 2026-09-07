import { api } from "@/api/util";
import type { Result } from "@/types/utils/result";

export interface ArtworkAllocation {
  artworkVersion: number;
  slot: { putUrl: string; headers: Record<string, string> } | null;
}

export interface ArtworkExport {
  artworkVersion: number;
  artworkHash: string;
  extension: string;
  downloadUrl: string;
}

export async function allocArtwork(
  chapterId: string,
  artworkHash: string,
  byteLength: number,
): Promise<Result<ArtworkAllocation>> {
  const result = await api.post<{
    artwork_version: number;
    slot: { put_url: string; headers: Record<string, string> } | null;
  }, { artwork_hash: string; new_byte_len: number; ext: string }>(
    `/chapters/${chapterId}/artwork/alloc`,
    { artwork_hash: artworkHash, new_byte_len: byteLength, ext: "xz" },
  );
  if (!result.success) {return result;}
  return {
    success: true,
    data: {
      artworkVersion: result.data.artwork_version,
      slot: result.data.slot === null ? null : {
        putUrl: result.data.slot.put_url,
        headers: result.data.slot.headers,
      },
    },
  };
}

export function markArtworkUploaded(chapterId: string, artworkVersion: number) {
  return api.post<undefined, { artwork_version: number }>(
    `/chapters/${chapterId}/artwork/mark-uploaded`,
    { artwork_version: artworkVersion },
  );
}

export async function exportArtwork(
  chapterId: string,
): Promise<Result<ArtworkExport>> {
  const result = await api.get<{
    artwork_version: number;
    artwork_hash: string;
    ext: string;
    download_url: string;
  }>(`/chapters/${chapterId}/artwork/export`);
  if (!result.success) {return result;}
  return {
    success: true,
    data: {
      artworkVersion: result.data.artwork_version,
      artworkHash: result.data.artwork_hash,
      extension: result.data.ext,
      downloadUrl: result.data.download_url,
    },
  };
}
