import type { TranslatorMode } from "@/types/translatorMode";

type TranslatorCapabilities = {
  canTranslate: boolean;
  canProofread: boolean;
};

export type TranslatorCompletionStage = "translate" | "proofread";

export function translatorCompletionStage({
  canTranslate,
  canProofread,
}: TranslatorCapabilities): TranslatorCompletionStage | undefined {
  if (canProofread) return "proofread";
  if (canTranslate) return "translate";
  return undefined;
}

export function availableTranslatorModes({
  canTranslate,
  canProofread,
}: TranslatorCapabilities): TranslatorMode[] {
  // 校对优先：翻校进入校对模式，并可切换到翻译模式。
  if (canTranslate && canProofread) return ["proofread", "translate"];
  if (canProofread) return ["proofread"];
  if (canTranslate) return ["translate", "readOnly"];
  return ["readOnly"];
}

export function initialTranslatorMode(
  availableModes: TranslatorMode[],
  requestedMode?: TranslatorMode,
): TranslatorMode {
  if (requestedMode === "readOnly") return "readOnly";

  return availableModes[0];
}
