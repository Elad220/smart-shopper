declare module 'react/jsx-runtime' {
  import * as React from 'react';
  export function jsx(type: any, props: any, key?: any): React.ReactElement;
  export function jsxs(type: any, props: any, key?: any): React.ReactElement;
  export function jsxDEV(
    type: any,
    props: any,
    key?: any,
    isStaticChildren?: boolean,
    source?: any,
    self?: any,
  ): React.ReactElement;
  export const Fragment: React.FC;
}