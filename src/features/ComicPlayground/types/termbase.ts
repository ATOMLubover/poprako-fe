export interface ListComicTermbasesArgs {
  comicId: string;
  fuzzyName?: string;
  offset: number;
  limit: number;
}

export interface RawListComicTermbasesArgs {
  comic_id: string;
  fuzzy_name?: string;
  offset: number;
  limit: number;
}

export interface CreateComicTermbaseArgs {
  comicId: string;
  name: string;
  description?: string;
}

export interface RawCreateComicTermbaseArgs {
  comic_id: string;
  name: string;
  description?: string;
}

export interface UpdateTermbaseArgs {
  name: string;
  description?: string;
}

export interface RawUpdateTermbaseArgs {
  id: string;
  name: string;
  description?: string;
}
