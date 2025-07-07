declare module 'react-hot-toast' {
  import * as React from 'react';

  export interface ToastOptions {
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    [key: string]: any;
  }

  export interface ToasterProps {
    position?: ToastOptions['position'];
    toastOptions?: ToastOptions;
  }

  export const Toaster: React.FC<ToasterProps>;

  export type ToastHandler = (message: string, options?: ToastOptions) => string | number;

  export const toast: {
    (message: string, options?: ToastOptions): string | number;
    success: ToastHandler;
    error: ToastHandler;
    dismiss: (id?: string | number) => void;
  };

  export default toast;
}