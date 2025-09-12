import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, RotateCcw, Info } from "lucide-react";
import { getFeatureFlagDescription } from "@/utils/featureFlags";

/**
 * Feature Flag Settings page that allows all users to view and modify feature flags
 * This page provides a centralized interface for managing feature flags across the application
 */
export default function FeatureFlagSettings() {
  const { flags, toggleFlag, resetFlags } = useFeatureFlags();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-gray-900">
              Feature Flag Settings
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage feature flags to enable or disable specific functionality across the application.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                Important Notes
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Changes are temporary and will reset on page refresh</li>
                <li>These settings affect the current browser session only</li>
                <li>Some features may require additional permissions or data to function properly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Flags Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Available Feature Flags
              </CardTitle>
              <Button
                onClick={resetFlags}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Toggle individual feature flags to enable or disable specific functionality.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(flags).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getFeatureFlagDescription(key)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        value ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {value ? "Enabled" : "Disabled"}
                    </span>
                    <Button
                      onClick={() => toggleFlag(key as keyof typeof flags)}
                      variant={value ? "default" : "secondary"}
                      size="sm"
                      className={`min-w-[80px] ${
                        value
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {value ? "ON" : "OFF"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-gray-500">
                Feature flags help control the rollout of features and can also be used for A/B testing in the future.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
