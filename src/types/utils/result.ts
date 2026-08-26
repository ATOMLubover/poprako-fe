export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      httpStatus?: number;
    };

export type ResultFailure = Extract<Result<unknown>, { success: false }>;
