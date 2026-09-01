import { describe, expect, test } from "vitest";
import type { ChapterInfo } from "@/types";
import type { WorkflowTransition } from "@/features/ComicPlayground/types/chapter";
import { applyWorkflowTransition } from "./utils";

function chapter(stages: number): ChapterInfo {
  return {
    id: "chapter-1",
    comicId: "comic-1",
    index: 0,
    subtitle: "",
    isPinned: false,
    pageCount: 0,
    totalUnitCount: 0,
    translatedUnitCount: 0,
    proofreadUnitCount: 0,
    stages,
    creatorId: "user-1",
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("applyWorkflowTransition", () => {
  test.each<[WorkflowTransition, number]>([
    ["upload_complete", 0],
    ["review_complete", 8],
    ["publish_complete", 10],
  ])("completes the binary stage for %s", (transition, offset) => {
    const stages = 0b10 << 2;
    const updated = applyWorkflowTransition(chapter(stages), transition);

    const updatedStages = updated.stages ?? 0;
    expect((updatedStages >> offset) & 0b11).toBe(0b10);
    expect((updatedStages >> 2) & 0b11).toBe(0b10);
  });

  test.each<[WorkflowTransition, number]>([
    ["upload_revert", 0],
    ["review_revert", 8],
  ])("reverts the binary stage for %s", (transition, offset) => {
    const stages = (0b10 << offset) | (0b10 << 2);
    const updated = applyWorkflowTransition(chapter(stages), transition);

    const updatedStages = updated.stages ?? 0;
    expect((updatedStages >> offset) & 0b11).toBe(0b00);
    expect((updatedStages >> 2) & 0b11).toBe(0b10);
  });
});
