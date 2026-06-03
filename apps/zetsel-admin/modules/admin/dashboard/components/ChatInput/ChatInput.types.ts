export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  responseMode: 'FastResponse' | 'SlowResponse';
  onResponseModeChange: (mode: 'FastResponse' | 'SlowResponse') => void;
}
