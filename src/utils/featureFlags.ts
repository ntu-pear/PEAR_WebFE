// Default feature flags from environment variables
export const defaultFeatureFlags = {
  production: import.meta.env.MODE === 'production', // true when built for staging and production
  development: import.meta.env.MODE === 'development', // true when running locally
  staging: import.meta.env.VITE_FEATURE_FLAG_STAGING === 'true', // staging builds use MODE=production. Needs to be explicitly set to 'staging'

  // custom feature flags
  // add more flags here as needed
  flag_panel: import.meta.env.VITE_FEATURE_FLAG_PANEL === 'true', // to enable the feature flag panel for testing
} as const;

export type FeatureFlags = typeof defaultFeatureFlags;