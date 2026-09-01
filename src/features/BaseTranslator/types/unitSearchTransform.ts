import type { UnitInfo } from "@/types/unit";
import type { Result } from "@/types/utils/result";

export type UnitTextPart = "translatedText" | "proofreadText";

export interface UnitSearchMatch {
  pageId: string;
  unit: UnitInfo;
}

export interface SearchUnitsArgs {
  part: UnitTextPart;
  phrase: string;
}

export interface TransformUnitsArgs {
  part: UnitTextPart;
  origin: string;
  target: string;
  unitIds: string[];
}

export interface UnitSearchTransformDataSource {
  search: (args: SearchUnitsArgs) => Promise<Result<UnitSearchMatch[]>>;
  transform: (args: TransformUnitsArgs) => Promise<Result<void>>;
  reloadPage: (pageId: string) => Promise<Result<UnitInfo[]>>;
}
