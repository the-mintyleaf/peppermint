export interface PasswordChangePageProps {
  changePasswordApi: string;
  successRedirectUrl?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}
