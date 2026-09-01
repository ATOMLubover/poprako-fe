/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { describe, expect, test, vi } from "vitest";

import { buildUnitDiff, persistDirtyUnits } from "./useUnitPersistence";
import type { UnitInfo } from "@/types/unit";
import { moveUnitToIndex, normalizeUnitIndexes } from "@/types/unit";

function unitAt(units: UnitInfo[], index: number): UnitInfo {
  const unit = units[index];
  if (!unit) {throw new Error("测试 Unit 缺失");}
  return unit;
}

const localUnit: UnitInfo = {
  id: "local_1",
  xCoord: 0.1,
  yCoord: 0.2,
  index: 0,
  isBubble: true,
  isProofread: false,
};

describe("unit save persistence", () => {
  test("reloads authoritative units after save and ignores save mappers", async () => {
    const remoteUnits: UnitInfo[] = [
      {
        id: "unit_from_other_submit",
        xCoord: 0.7,
        yCoord: 0.8,
        index: 0,
        isBubble: false,
        isProofread: true,
      },
      {
        id: "unit_99",
        xCoord: 0.1,
        yCoord: 0.2,
        index: 1,
        isBubble: true,
        isProofread: false,
      },
    ];
    const calls: string[] = [];
    const onSaveUnits = vi.fn(async (_pageId: string, _diff: unknown) => {
      calls.push("save");
    });
    const onReloadUnits = vi.fn(async () => {
      calls.push("reload");
      return remoteUnits;
    });

    const result = await persistDirtyUnits({
      pageId: "page_1",
      currentUnits: [localUnit],
      baselineUnits: [],
      onSaveUnits,
      onReloadUnits,
    });

    expect(result).toEqual({ status: "saved", units: remoteUnits });
    expect(calls).toEqual(["save", "reload"]);
    expect(onSaveUnits.mock.calls[0]?.[1]).toEqual({
      ops: [{
        edit: "create",
        localId: "local_1",
        isBubble: true,
        coord: { xCoord: 0.1, yCoord: 0.2 },
      }],
    });
  });

  test("does not save or reload when units are unchanged", async () => {
    const onSaveUnits = vi.fn();
    const onReloadUnits = vi.fn();

    const result = await persistDirtyUnits({
      pageId: "page_1",
      currentUnits: [localUnit],
      baselineUnits: [localUnit],
      onSaveUnits,
      onReloadUnits,
    });

    expect(result).toEqual({ status: "clean" });
    expect(onSaveUnits).not.toHaveBeenCalled();
    expect(onReloadUnits).not.toHaveBeenCalled();
  });

  test("clears translation and preserves proofreading status when text is removed", () => {
    const baseline: UnitInfo[] = [{
      ...localUnit,
      id: "unit_1",
      translatedText: "existing translation",
      translatorId: "translator_1",
      isProofread: true,
      proofreadText: "existing revision",
      proofreaderId: "proofreader_1",
    }];
    const current: UnitInfo[] = [{
      ...unitAt(baseline, 0),
      translatedText: undefined,
      translatorId: undefined,
      proofreadText: undefined,
      proofreaderId: undefined,
    }];

    expect(buildUnitDiff(current, baseline)).toEqual({
      ops: [{
        edit: "patch",
        id: "unit_1",
        nextId: { type: "skip" },
        translation: { type: "clear" },
        revision: {
          type: "assign",
          value: { isProofread: true, proofreadText: undefined },
        },
      }],
    });
  });

  test("updates proofreading status without changing revision text", () => {
    const baseline: UnitInfo[] = [{
      ...localUnit,
      id: "unit_1",
      isProofread: true,
      proofreadText: "existing revision",
    }];
    const current: UnitInfo[] = [{ ...unitAt(baseline, 0), isProofread: false }];

    expect(buildUnitDiff(current, baseline)).toEqual({
      ops: [{
        edit: "patch",
        id: "unit_1",
        nextId: { type: "skip" },
        translation: { type: "skip" },
        revision: {
          type: "assign",
          value: { isProofread: false, proofreadText: "existing revision" },
        },
      }],
    });
  });

  test("saves removed translation text instead of treating it as clean", async () => {
    const baseline: UnitInfo[] = [{
      ...localUnit,
      id: "unit_1",
      translatedText: "existing translation",
      translatorId: "translator_1",
    }];
    const current: UnitInfo[] = [{
      ...unitAt(baseline, 0),
      translatedText: undefined,
      translatorId: undefined,
    }];
    const onSaveUnits = vi.fn();
    const onReloadUnits = vi.fn(async () => current);

    await persistDirtyUnits({
      pageId: "page_1",
      currentUnits: current,
      baselineUnits: baseline,
      onSaveUnits,
      onReloadUnits,
    });

    expect(onSaveUnits).toHaveBeenCalledWith("page_1", {
      ops: [{
        edit: "patch",
        id: "unit_1",
        nextId: { type: "skip" },
        translation: { type: "clear" },
        revision: { type: "skip" },
      }],
    });
  });

  test("normalizes indexes and expresses order through nextId edits", () => {
    const baseline = normalizeUnitIndexes([
      { ...localUnit, id: "unit_a", index: 10 },
      { ...localUnit, id: "unit_b", index: 10 },
      { ...localUnit, id: "unit_c", index: 80 },
    ]);
    const current = normalizeUnitIndexes([
      { ...unitAt(baseline, 1), xCoord: 0.5, index: 99 },
      { ...localUnit, id: "local_new", index: 99 },
      { ...unitAt(baseline, 0), index: 5 },
    ]);

    expect(current.map((unit) => unit.index)).toEqual([0, 1, 2]);
    expect(buildUnitDiff(current, baseline)).toEqual({
      ops: [
        { edit: "delete", id: "unit_c" },
        {
          edit: "patch",
          id: "unit_a",
          nextId: { type: "clear" },
          translation: { type: "skip" },
          revision: { type: "skip" },
        },
        {
          edit: "patch",
          id: "unit_b",
          nextId: { type: "assign", value: "local_new" },
          coord: { xCoord: 0.5, yCoord: 0.2 },
          translation: { type: "skip" },
          revision: { type: "skip" },
        },
        {
          edit: "create",
          localId: "local_new",
          nextId: "unit_a",
          isBubble: true,
          coord: { xCoord: 0.1, yCoord: 0.2 },
        },
      ],
    });
  });

  test("persists a pure move through nextId patches and reloads its order", async () => {
    const baseline = normalizeUnitIndexes([
      { ...localUnit, id: "unit_a" },
      { ...localUnit, id: "unit_b" },
      { ...localUnit, id: "unit_c" },
    ]);
    const current = moveUnitToIndex(baseline, "unit_c", 0);
    const onSaveUnits = vi.fn();
    const onReloadUnits = vi.fn(async () => current);

    const result = await persistDirtyUnits({
      pageId: "page_1",
      currentUnits: current,
      baselineUnits: baseline,
      onSaveUnits,
      onReloadUnits,
    });

    expect(onSaveUnits).toHaveBeenCalledWith("page_1", {
      ops: [
        {
          edit: "patch",
          id: "unit_b",
          nextId: { type: "clear" },
          translation: { type: "skip" },
          revision: { type: "skip" },
        },
        {
          edit: "patch",
          id: "unit_a",
          nextId: { type: "assign", value: "unit_b" },
          translation: { type: "skip" },
          revision: { type: "skip" },
        },
        {
          edit: "patch",
          id: "unit_c",
          nextId: { type: "assign", value: "unit_a" },
          translation: { type: "skip" },
          revision: { type: "skip" },
        },
      ],
    });
    expect(result).toEqual({ status: "saved", units: current });
  });
});
