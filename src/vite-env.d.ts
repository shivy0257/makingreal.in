/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string;
  readonly VITE_CLARITY_ID?: string;
  readonly VITE_WEB3FORMS_KEY?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
