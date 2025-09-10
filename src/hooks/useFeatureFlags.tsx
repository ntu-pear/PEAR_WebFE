import { createContext, useContext, useState } from "react";
import { defaultFeatureFlags, FeatureFlags } from "@/utils/featureFlags";

// Context and Provider
type FeatureFlagContextType = {
  flags: FeatureFlags;
  toggleFlag: (key: keyof FeatureFlags) => void;
  resetFlags: () => void;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

/**
 * Context provider for feature flags to change flags at runtime
 */
export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFeatureFlags);

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetFlags = () => {
    setFlags(defaultFeatureFlags);
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag, resetFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Hooks

/**
 * For getting all feature flags and controls
 * @returns object with flags, toggleFlag, and resetFlags functions
 */
export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error("useFeatureFlags must be used inside FeatureFlagProvider");
  }
  return ctx;
};

/**
 * For checking if a feature is enabled at runtime
 * @param feature - The feature flag key to check
 * @returns boolean indicating if the feature is enabled
 */
export const useFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  const { flags } = useFeatureFlags();
  return flags[feature];
};

/**
 * For checking if any feature in a list is enabled at runtime
 * @param features - Array of feature flag keys to check
 * @returns boolean indicating if any feature is enabled
 */
export const useAnyFeatureFlag = (
  features: (keyof FeatureFlags)[]
): boolean => {
  return features.some((feature) => useFeatureFlag(feature));
};

/**
 * For checking if a feature is enabled at buildtime (independent of context provider)
 * @param feature - The feature flag key to check
 * @returns boolean indicating if the feature is enabled
 */
export const useStaticFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  return defaultFeatureFlags[feature];
};
