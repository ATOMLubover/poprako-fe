export interface LoginUserArgs { qq: string; password: string }
export interface LoginUserResult { accessToken: string; userId: string }

export interface RegisterUserArgs {
  qq: string;
  password: string;
  name: string;
  invitationCode: string;
}
export type RegisterUserResult = LoginUserResult;

export interface UpdateUserArgs {
  userId: string;
  qq?: string | undefined;
  name?: string | undefined;
  password?: string | undefined;
}
