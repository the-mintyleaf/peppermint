import { ResponseMode } from '../../home.types';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  responseMode: ResponseMode;
  onResponseModeChange: (mode: ResponseMode) => void;
  variant?: 'hero' | 'inline';
}
