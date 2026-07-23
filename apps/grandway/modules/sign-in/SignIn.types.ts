export interface SignInFormValues extends Record<string, unknown> {
  username: string;
  password: string;
  otp_code: string;
}
