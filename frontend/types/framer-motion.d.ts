declare module 'framer-motion' {
  import * as React from 'react';

  // Basic motion component wrapper
  export interface MotionProps {
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const motion: {
    div: React.FC<MotionProps>;
    span: React.FC<MotionProps>;
    button: React.FC<MotionProps>;
    // Allow any HTML tag via index signature
    [key: string]: React.FC<MotionProps>;
  };

  export const AnimatePresence: React.FC<any>;
}