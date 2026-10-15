import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import App from "./App";
import "./index.css";
import { FeatureFlagProvider } from "./hooks/useFeatureFlags";

dayjs.extend(customParseFormat);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FeatureFlagProvider>
      <App />
    </FeatureFlagProvider>
  </StrictMode>
);
