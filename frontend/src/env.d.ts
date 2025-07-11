/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SVG element type definitions
declare namespace JSX {
  interface IntrinsicElements {
    svg: React.SVGProps<SVGSVGElement>;
    defs: React.SVGProps<SVGDefsElement>;
    linearGradient: React.SVGProps<SVGLinearGradientElement>;
    stop: React.SVGProps<SVGStopElement>;
    rect: React.SVGProps<SVGRectElement>;
    text: React.SVGProps<SVGTextElement>;
    g: React.SVGProps<SVGGElement>;
    path: React.SVGProps<SVGPathElement>;
    circle: React.SVGProps<SVGCircleElement>;
  }
}
