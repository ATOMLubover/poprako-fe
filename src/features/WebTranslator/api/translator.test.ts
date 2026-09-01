import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  listEdittedDiffPageIds,
  searchChapterUnits,
  transformChapterUnits,
} from "./translator";

function okJson(data: unknown) {
  return Response.json({ code: 0, data }, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("chapter unit search and transform API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("unwraps editted diff page IDs in server page order", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({
      page_ids: ["page-2", "page-5"],
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await listEdittedDiffPageIds("chapter-1");

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "/api/v1/chapters/chapter-1/pages/editted-diffs",
    );
    expect(result).toEqual({
      success: true,
      data: ["page-2", "page-5"],
    });
  });

  test("maps search query fields and unwraps page ownership", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson([{
      id: "unit-1",
      page_id: "page-2",
      is_bubble: true,
      is_proofread: false,
      x_coord: 0.1,
      y_coord: 0.2,
      translated_text: "旧词旧词",
      created_at: 1,
      updated_at: 2,
    }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchChapterUnits("chapter-1", {
      part: "translatedText",
      phrase: "旧词",
    });

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "/api/v1/chapters/chapter-1/units/search?part=translated_text&phrase=%E6%97%A7%E8%AF%8D",
    );
    expect(result.success && result.data[0]).toMatchObject({
      pageId: "page-2",
      unit: { id: "unit-1", translatedText: "旧词旧词" },
    });
  });

  test("builds one transform pair for every selected unit", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await transformChapterUnits("chapter-1", {
      part: "proofreadText",
      origin: "旧词",
      target: "新词",
      unitIds: ["unit-1", "unit-2"],
    });
    const request = fetchMock.mock.calls[0][1] as RequestInit;

    expect(result).toEqual({ success: true, data: undefined });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "/api/v1/chapters/chapter-1/units/transform",
    );
    expect(JSON.parse(request.body as string)).toEqual({
      part: "proofread_text",
      units: [
        {
          unit_id: "unit-1",
          transforms: [{ origin: "旧词", target: "新词" }],
        },
        {
          unit_id: "unit-2",
          transforms: [{ origin: "旧词", target: "新词" }],
        },
      ],
    });
  });
});
