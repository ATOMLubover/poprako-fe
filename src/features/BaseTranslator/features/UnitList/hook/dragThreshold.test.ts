import { describe, expect, it } from "vitest";
import { dragThreshold, exceedsDragThreshold } from "./dragThreshold";

describe("dragThreshold", () => {
  it("allows more touch movement before starting a drag", () => {
    expect(dragThreshold("touch")).toBe(8);
  });

  it.each(["mouse", "pen", ""])(
    "keeps the precise pointer threshold for %s input",
    (pointerType) => {
      expect(dragThreshold(pointerType)).toBe(4);
    },
  );
});

describe("exceedsDragThreshold", () => {
  it("keeps an eight-pixel touch movement as a tap", () => {
    expect(exceedsDragThreshold("touch", 8, 0)).toBe(false);
  });

  it("starts a touch drag after moving beyond eight pixels", () => {
    expect(exceedsDragThreshold("touch", 8, 1)).toBe(true);
  });

  it("starts a mouse drag after moving beyond four pixels", () => {
    expect(exceedsDragThreshold("mouse", 4, 1)).toBe(true);
  });
});
