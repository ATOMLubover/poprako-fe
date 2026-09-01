import { diffArrays } from "diff";

export interface UnitTextDiffPart {
  kind:
    | "unchanged"
    | "deleted"
    | "inserted"
    | "replacement-removed"
    | "replacement-added";
  text: string;
}

interface RawDiffPart {
  kind: "unchanged" | "removed" | "added";
  text: string;
}

const wordSegmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("zh", { granularity: "word" })
  : undefined;

function tokenizeText(text: string): string[] {
  if (!wordSegmenter) {
    return [...text]; // eslint-disable-line @typescript-eslint/no-misused-spread
  }
  return Array.from(wordSegmenter.segment(text), ({ segment }) => segment);
}

function mergeAdjacentParts(parts: UnitTextDiffPart[]): UnitTextDiffPart[] {
  const merged: UnitTextDiffPart[] = [];
  for (const part of parts) {
    const previous = merged.at(-1);
    if (previous?.kind === part.kind) {
      previous.text += part.text;
      continue;
    }
    merged.push({ ...part });
  }
  return merged;
}

function orderReplacementParts(parts: RawDiffPart[]): UnitTextDiffPart[] {
  const ordered: UnitTextDiffPart[] = [];
  let index = 0;

  while (index < parts.length) {
    if (parts[index].kind === "unchanged") {
      ordered.push({ kind: "unchanged", text: parts[index].text });
      index += 1;
      continue;
    }

    const changed: RawDiffPart[] = [];
    while (index < parts.length && parts[index].kind !== "unchanged") {
      changed.push(parts[index]);
      index += 1;
    }
    const isReplacement = changed.some((part) => part.kind === "removed")
      && changed.some((part) => part.kind === "added");
    ordered.push(
      ...changed
        .filter((part) => part.kind === "removed")
        .map<UnitTextDiffPart>((part) => ({
          kind: isReplacement ? "replacement-removed" : "deleted",
          text: part.text,
        })),
      ...changed
        .filter((part) => part.kind === "added")
        .map<UnitTextDiffPart>((part) => ({
          kind: isReplacement ? "replacement-added" : "inserted",
          text: part.text,
        })),
    );
  }

  return mergeAdjacentParts(ordered);
}

export function buildUnitTextDiff(
  translatedText: string | null,
  proofreadText: string | null,
): UnitTextDiffPart[] {
  if (!proofreadText) {
    return translatedText
      ? [{ kind: "unchanged", text: translatedText }]
      : [];
  }

  const changes = diffArrays(
    tokenizeText(translatedText ?? ""),
    tokenizeText(proofreadText),
  );
  const parts = changes.map<RawDiffPart>((change) => ({
    kind: change.removed
      ? "removed"
      : (change.added
        ? "added"
        : "unchanged"),
    text: change.value.join(""),
  }));

  return orderReplacementParts(parts);
}
