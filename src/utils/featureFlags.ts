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

// Descriptions for each feature flag to display in settings
export const FeatureFlagDescriptions: Record<string, string> = {
  production: "Indicates if the application is running in production mode",
  development: "Indicates if the application is running in development mode",
  staging: "Indicates if the application is running in staging environment",
  flag_panel: "Shows/hides the floating feature flag panel in the bottom-right corner",
  // Add more descriptions as new feature flags are added
};

/**
 * Helper function to provide descriptive text for each feature flag
 */
export const getFeatureFlagDescription = (flagKey: string): string => {
  return FeatureFlagDescriptions[flagKey] || "No description available for this feature flag";
}

/**
 * Which environment's logs the Logger Service should be asked for.
 * Staging and production share one Elasticsearch index, so without this
 * every log request returns both environments' entries mixed together.
 */
export const getCurrentLogEnvironment = (): "staging" | "production" | undefined => {
  if (defaultFeatureFlags.staging) return "staging";
  if (defaultFeatureFlags.production) return "production";
  return undefined;
}