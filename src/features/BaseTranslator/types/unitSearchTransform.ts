import type { UnitInfo } from "@/types/unit";
import type { Result } from "@/types/utils/result";

export type UnitTextPart = "translatedText" | "proofreadText";

export type UnitSearchMatch = {
  pageId: string;
  unit: UnitInfo;
};

export type SearchUnitsArgs = {
  part: UnitTextPart;
  phrase: string;
};

export type TransformUnitsArgs = {
  part: UnitTextPart;
  origin: string;
  target: string;
  unitIds: string[];
};

export type UnitSearchTransformDataSource = {
  search: (args: SearchUnitsArgs) => Promise<Result<UnitSearchMatch[]>>;
  transform: (args: TransformUnitsArgs) => Promise<Result<void>>;
  reloadPage: (pageId: string) => Promise<Result<UnitInfo[]>>;
};
