/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PATIENT_SERVICE_URL: string;
  readonly VITE_GEOCODE_SERVICE_URL: string;
  readonly VITE_USER_SERVICE_URL: string;
  readonly VITE_LOGGER_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
