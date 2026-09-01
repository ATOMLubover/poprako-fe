import type { TranslatorMode } from "@/types/translatorMode";

interface TranslatorCapabilities {
  canTranslate: boolean;
  canProofread: boolean;
}

export type TranslatorCompletionStage = "translate" | "proofread";

export function translatorCompletionStage({
  canTranslate,
  canProofread,
}: TranslatorCapabilities): TranslatorCompletionStage | undefined {
  if (canProofread) {return "proofread";}
  if (canTranslate) {return "translate";}
  return undefined;
}

export function availableTranslatorModes({
  canTranslate,
  canProofread,
}: TranslatorCapabilities): TranslatorMode[] {
  const modes: TranslatorMode[] = [];

  // 顺序同时定义默认模式优先级：校对 > 翻译 > 只读。
  if (canProofread) {modes.push("proofread");}
  if (canTranslate) {modes.push("translate");}
  modes.push("readOnly");

  return modes;
}

export function initialTranslatorMode(
  availableModes: TranslatorMode[],
  requestedMode?: TranslatorMode,
): TranslatorMode {
  if (requestedMode === "readOnly") {return "readOnly";}

  return availableModes[0];
}
