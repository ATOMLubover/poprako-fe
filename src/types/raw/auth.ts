import type {
  LoginUserArgs,
  LoginUserResult,
  RegisterUserArgs,
  RegisterUserResult,
  UpdateUserArgs,
} from "../auth";

export interface RawLoginUserArgs { qid: string; password: string }
export function unwrapRawLoginUserArgs(raw: RawLoginUserArgs): LoginUserArgs {
  return { qq: raw.qid, password: raw.password };
}

export interface RawLoginUserResult { token: string; user_id: string }
export function unwrapRawLoginUserResult(
  raw: RawLoginUserResult,
): LoginUserResult {
  return { accessToken: raw.token, userId: raw.user_id };
}

export interface RawRegisterUserArgs {
  qid: string;
  password: string;
  nickname: string;
  code: string;
}
export function unwrapRawRegisterUserArgs(
  raw: RawRegisterUserArgs,
): RegisterUserArgs {
  return {
    qq: raw.qid,
    password: raw.password,
    name: raw.nickname,
    invitationCode: raw.code,
  };
}

export interface RawRegisterUserResult { token: string; user_id: string }
export function unwrapRawRegisterUserResult(
  raw: RawRegisterUserResult,
): RegisterUserResult {
  return { accessToken: raw.token, userId: raw.user_id };
}

export interface RawUpdateUserArgs {
  user_id: string;
  qid?: string | undefined;
  name?: string | undefined;
  password?: string | undefined;
}
export function unwrapRawUpdateUserArgs(
  raw: RawUpdateUserArgs,
): UpdateUserArgs {
  return {
    userId: raw.user_id,
    qq: raw.qid,
    name: raw.name,
    password: raw.password,
  };
}
