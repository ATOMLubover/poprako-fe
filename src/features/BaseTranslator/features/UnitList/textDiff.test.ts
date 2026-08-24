import { describe, expect, test } from "vitest";
import { buildUnitTextDiff } from "./textDiff";

describe("buildUnitTextDiff", () => {
  test("keeps untranslated proofreading absence as unchanged translation", () => {
    expect(buildUnitTextDiff("原始翻译", null)).toEqual([
      { kind: "unchanged", text: "原始翻译" },
    ]);
  });

  test("keeps identical proofreading text unchanged", () => {
    expect(buildUnitTextDiff("完全相同。", "完全相同。")).toEqual([
      { kind: "unchanged", text: "完全相同。" },
    ]);
  });

  test("groups Chinese replacements by word", () => {
    expect(buildUnitTextDiff(
      "不……这不可能。",
      "不……这怎么可能。",
    )).toEqual([
      { kind: "unchanged", text: "不……这" },
      { kind: "replacement-removed", text: "不可能" },
      { kind: "replacement-added", text: "怎么可能" },
      { kind: "unchanged", text: "。" },
    ]);
  });

  test("places proofreading additions after translated removals", () => {
    const parts = buildUnitTextDiff("天气很好。", "天气不错。");
    expect(parts).toEqual([
      { kind: "unchanged", text: "天气" },
      { kind: "replacement-removed", text: "很好" },
      { kind: "replacement-added", text: "不错" },
      { kind: "unchanged", text: "。" },
    ]);
  });

  test("shows a pure deletion without inventing a proofreading patch", () => {
    expect(buildUnitTextDiff("我真的很好", "我很好")).toEqual([
      { kind: "unchanged", text: "我" },
      { kind: "deleted", text: "真的" },
      { kind: "unchanged", text: "很好" },
    ]);
  });

  test("shows an insertion between unchanged Chinese words", () => {
    expect(buildUnitTextDiff("我很好。", "我今天很好。")).toEqual([
      { kind: "unchanged", text: "我" },
      { kind: "inserted", text: "今天" },
      { kind: "unchanged", text: "很好。" },
    ]);
  });

  test("preserves whitespace and punctuation edits", () => {
    expect(buildUnitTextDiff("你好 世界", "你好，世界")).toEqual([
      { kind: "unchanged", text: "你好" },
      { kind: "replacement-removed", text: " " },
      { kind: "replacement-added", text: "，" },
      { kind: "unchanged", text: "世界" },
    ]);
  });

  test("treats proofreading without translation as an addition", () => {
    expect(buildUnitTextDiff(null, "新增校对")).toEqual([
      { kind: "inserted", text: "新增校对" },
    ]);
  });

  test("returns no parts when both texts are absent", () => {
    expect(buildUnitTextDiff(null, null)).toEqual([]);
  });

  test("keeps a joined emoji as one word token", () => {
    expect(buildUnitTextDiff("一家人", "一家人👨‍👩‍👧‍👦")).toEqual([
      { kind: "unchanged", text: "一家人" },
      { kind: "inserted", text: "👨‍👩‍👧‍👦" },
    ]);
  });

  test("can reconstruct both source texts from the parts", () => {
    const translatedText = "早安，天气很好。\n明天见。";
    const proofreadText = "早上好，今天天气不错。\n后天见。";
    const parts = buildUnitTextDiff(translatedText, proofreadText);
    const reconstructedTranslation = parts
      .filter((part) => (
        part.kind !== "inserted" && part.kind !== "replacement-added"
      ))
      .map((part) => part.text)
      .join("");
    const reconstructedProofreading = parts
      .filter((part) => (
        part.kind !== "deleted" && part.kind !== "replacement-removed"
      ))
      .map((part) => part.text)
      .join("");

    expect(reconstructedTranslation).toBe(translatedText);
    expect(reconstructedProofreading).toBe(proofreadText);
  });
});
