declare module 'react/jsx-runtime' {
  import * as React from 'react';
  export function jsx(type: React.ElementType, props: any, key?: string): React.ReactElement;
  export function jsxs(type: React.ElementType, props: any, key?: string): React.ReactElement;
  export const Fragment: React.FC<{ children?: React.ReactNode }>;
}