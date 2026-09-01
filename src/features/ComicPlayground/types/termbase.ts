export interface ListComicTermbasesArgs {
  comicId: string;
  fuzzyName?: string | undefined;
  offset: number;
  limit: number;
}

export interface RawListComicTermbasesArgs {
  comic_id: string;
  fuzzy_name?: string | undefined;
  offset: number;
  limit: number;
}

export interface CreateComicTermbaseArgs {
  comicId: string;
  name: string;
  description?: string | undefined;
}

export interface RawCreateComicTermbaseArgs {
  comic_id: string;
  name: string;
  description?: string | undefined;
}

export interface UpdateTermbaseArgs {
  name: string;
  description?: string | undefined;
}

export interface RawUpdateTermbaseArgs {
  id: string;
  name: string;
  description?: string | undefined;
}
