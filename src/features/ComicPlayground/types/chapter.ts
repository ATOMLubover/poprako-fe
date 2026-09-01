export type ChapterInclude =
  | "comic"
  | "comic.workset"
  | "comic.workset.team"
  | "comic.creator"
  | "creator";

export type WorkflowTransition =
  | "upload_complete"
  | "translate_start"
  | "translate_complete"
  | "proofread_start"
  | "proofread_complete"
  | "typeset_start"
  | "typeset_complete"
  | "review_complete"
  | "publish_complete"
  | "upload_revert"
  | "translate_start_revert"
  | "translate_revert"
  | "proofread_start_revert"
  | "proofread_revert"
  | "typeset_start_revert"
  | "typeset_revert"
  | "review_revert";

export interface ListChapterArgs {
  comicId: string;
  includes?: ChapterInclude[];
  offset: number;
  limit: number;
}

export interface ListChapterWorkflowRecordsArgs {
  chapterId: string;
  offset: number;
  limit: number;
}

export interface RawListChapterArgs {
  comic_id: string;
  incl?: ChapterInclude[];
  offset: number;
  limit: number;
}

export interface CreateChapterArgs {
  comicId: string;
  subtitle?: string;
  presetAssignmentRoles?: number;
}

export interface RawCreateChapterArgs {
  comic_id: string;
  subtitle?: string;
  preset_assignment_roles?: number;
}

export interface UpdateChapterArgs {
  subtitle?: string;
  isPinned?: boolean;
  workflowTransition?: WorkflowTransition;
  revertTransition?: WorkflowTransition;
}

export interface RawUpdateChapterArgs {
  id: string;
  subtitle?: string;
}

export interface RawUpdateChapterStageArgs {
  id: string;
  stage:
    | "raw_provide"
    | "translate"
    | "proofread"
    | "typeset_redraw"
    | "review"
    | "publish";
  oper: "advance" | "revert";
}

export interface ChapterExportUnit {
  unitId?: string;
  unitIndex?: number;
  pageId?: string;
  pageIndex?: number;
  translatedText?: string;
  proofreadText?: string;
  translatorId?: string;
  proofreaderId?: string;
  translatorComment?: string;
  proofreaderComment?: string;
  xCoord?: number;
  yCoord?: number;
  isBubble?: boolean;
  isProofread?: boolean;
}

export interface ChapterExportPage {
  pageId: string;
  pageIndex: number;
  units: ChapterExportUnit[];
}

export interface ChapterExport {
  comicId: string;
  comicTitle: string;
  chapterId: string;
  chapterIndex: number;
  chapterSubtitle: string;
  pages: ChapterExportPage[];
}

export interface RawChapterExportUnit {
  unit_id?: string;
  unit_index?: number;
  page_id?: string;
  page_index?: number;
  translated_text?: string;
  proofread_text?: string;
  translator_id?: string;
  proofreader_id?: string;
  translator_comment?: string;
  proofreader_comment?: string;
  x_coord?: number;
  y_coord?: number;
  is_bubble?: boolean;
  is_proofread?: boolean;
}

export interface RawChapterExportPage {
  page_id: string;
  page_index: number;
  units: RawChapterExportUnit[];
}

export interface RawChapterExport {
  comic_id: string;
  comic_title: string;
  chapter_id: string;
  chapter_index: number;
  chapter_subtitle: string;
  pages: RawChapterExportPage[];
}

export interface ChapterExports {
  labelPlus: string;
  poprako: ChapterExport;
}

export interface RawChapterExports {
  label_plus: string | null;
  poprako: RawChapterExport | null;
}

export type ImportChapterFormat = "json" | "lp";

export type RawImportChapterFormat = "poprako" | "label_plus";

export interface ImportChapterArgs {
  chapterId: string;
  content: string;
  format: ImportChapterFormat;
}

export interface RawImportChapterArgs {
  chapter_id: string;
  content: string;
  format: RawImportChapterFormat;
}

export interface ImportChapterResult {
  importedPageCount: number;
  importedUnitCount: number;
}

export interface RawImportChapterResult {
  imported_page_count: number;
  imported_unit_count: number;
}
