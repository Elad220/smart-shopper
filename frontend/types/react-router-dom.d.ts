declare module 'react-router-dom' {
  import * as React from 'react';

  export interface NavigateProps {
    to: string;
    replace?: boolean;
  }

  export const BrowserRouter: React.FC<{ children?: React.ReactNode }>;
  // Alias commonly imported as Router
  export { BrowserRouter as Router };

  export const Routes: React.FC<{ children?: React.ReactNode }>;

  export interface RouteProps {
    path?: string;
    element: React.ReactElement;
  }
  export const Route: React.FC<RouteProps>;

  export const Navigate: React.FC<NavigateProps>;

  export function useNavigate(): (path: string, options?: { replace?: boolean }) => void;
}