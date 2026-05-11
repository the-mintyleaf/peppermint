import { showNotification, updateNotification } from '@mantine/notifications';
import type { NotificationData } from '@mantine/notifications';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export const triggerNotification = {
  success(message: string, options?: Partial<NotificationData>): void {
    showNotification({
      color: 'green',
      title: 'Success',
      message,
      autoClose: 4000,
      ...options,
    });
  },

  error(message: string, options?: Partial<NotificationData>): void {
    showNotification({
      color: 'red',
      title: 'Error',
      message,
      autoClose: 6000,
      ...options,
    });
  },

  info(message: string, options?: Partial<NotificationData>): void {
    showNotification({
      color: 'blue',
      title: 'Info',
      message,
      autoClose: 4000,
      ...options,
    });
  },

  warning(message: string, options?: Partial<NotificationData>): void {
    showNotification({
      color: 'yellow',
      title: 'Warning',
      message,
      autoClose: 5000,
      ...options,
    });
  },

  loading(message: string): string {
    const id = uid();
    showNotification({
      id,
      color: 'blue',
      loading: true,
      message,
      autoClose: false,
    });
    return id;
  },

  update(id: string, data: Partial<NotificationData>): void {
    updateNotification({ message: '', ...data, id });
  },

  form: {
    isLoading(): void {
      showNotification({
        id: 'form-submit',
        color: 'blue',
        loading: true,
        message: 'Saving…',
        autoClose: false,
      });
    },

    isSuccess(): void {
      updateNotification({
        id: 'form-submit',
        color: 'green',
        loading: false,
        title: 'Saved',
        message: 'Your changes have been saved.',
        autoClose: 3000,
      });
    },

    isError(error?: string): void {
      updateNotification({
        id: 'form-submit',
        color: 'red',
        loading: false,
        title: 'Save failed',
        message: error ?? 'Something went wrong. Please try again.',
        autoClose: 6000,
      });
    },
  },
};
