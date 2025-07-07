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

  /** Basic Toast metadata (subset of actual library type for our usage) */
  export interface Toast {
    /** Unique id for the toast */
    id: string;
    /** Is the toast currently visible */
    visible: boolean;
    /** Toast type */
    type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    /** Message content */
    message?: React.ReactNode;
    /** Optional icon */
    icon?: React.ReactNode;
    /** Inline style overrides */
    style?: React.CSSProperties;
    /** Display duration */
    duration?: number;
  }

  export interface ToastBarProps {
    toast: Toast;
    style?: React.CSSProperties;
    className?: string;
    /**
     * Children render function giving access to the icon and message nodes.
     */
    children?: (props: { icon?: React.ReactNode; message?: React.ReactNode }) => React.ReactNode;
  }

  /**
   * ToastBar component exported by react-hot-toast at runtime but missing from its type declarations.
   */
  export const ToastBar: React.FC<ToastBarProps>;
}