/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORM_API_URL?: string;
  readonly VITE_FORM_API_TOKEN?: string;
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_NOTION_API_URL?: string;
  readonly VITE_NOTION_API_TOKEN?: string;
  readonly VITE_OPENCLAW_HOST?: string;
  readonly VITE_OPENCLAW_PORT?: string;
  readonly VITE_OPENCLAW_SECURE?: string;
  readonly VITE_OPENCLAW_TOKEN?: string;
  readonly VITE_MARCO_OS_V2_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
