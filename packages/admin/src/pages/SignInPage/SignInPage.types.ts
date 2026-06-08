export interface SignInPageProps {
  heading?: [string, string];
  subheading?: string;
  icon?: React.ReactNode;
  loginApi: string;
  skipEmailValidation?: boolean;
  successRedirectUrl: string;
  forgotRedirectUrl?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onForgotPassword?: () => void;
  hasGoogleLogin?: boolean;
  hasAppleLogin?: boolean;
  hasDiscordLogin?: boolean;
  hasMagicLinkLogin?: boolean;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onDiscordLogin?: () => void;
  onMagicLinkLogin?: (email: string) => Promise<void>;
  disableSignUp?: boolean;
  disableForgotPassword?: boolean;
}
