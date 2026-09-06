import { api } from "@/api/util";
import type { Result } from "@/types/utils/result";

export interface ArtworkAllocation {
  artworkVersion: number;
  slot: { putUrl: string; headers: Record<string, string> } | null;
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
