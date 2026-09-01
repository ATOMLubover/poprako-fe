export interface ListTermsArgs {
  termbaseId: string;
  fuzzySource?: string | undefined;
  offset: number;
  limit: number;
}

export interface RawListTermsArgs {
  termbase_id: string;
  fuzzy_source?: string | undefined;
  offset: number;
  limit: number;
}

export interface CreateTermArgs {
  termbaseId: string;
  source: string;
  targets: string[];
  comment?: string | undefined;
}

export interface RawCreateTermArgs {
  termbase_id: string;
  source: string;
  targets: string[];
  comment?: string | undefined;
}

export interface UpdateTermArgs {
  source: string;
  targets: string[];
  comment?: string | undefined;
}

export interface RawUpdateTermArgs {
  id: string;
  source: string;
  targets: string[];
  comment?: string | undefined;
}
