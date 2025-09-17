import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { FeatureFlagProvider } from "./hooks/useFeatureFlags";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FeatureFlagProvider>
      <App />
    </FeatureFlagProvider>
  </StrictMode>
);
