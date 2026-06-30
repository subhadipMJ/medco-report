/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
  interface Window {
    Flutter?: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
