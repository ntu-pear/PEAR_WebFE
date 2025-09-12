import { useState } from "react";
import { useFeatureFlags, useFeatureFlag } from "@/hooks/useFeatureFlags";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, X, RotateCcw, ExternalLink } from "lucide-react";

// Interface to change flags at runtime for testing
export default function FeatureFlagPanel() {
  const { flags, toggleFlag, resetFlags } = useFeatureFlags();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // This variable is set when building the app
  if (!useFeatureFlag("flag_panel")) {
    return null; // Don't show in production
  }

  const handleNavigateToSettings = () => {
    const roleName = currentUser?.roleName?.toLowerCase().replace(" ", "-");
    if (roleName) {
      navigate(`/${roleName}/feature-flag-settings`);
    } else {
      // Fallback for custom roles
      navigate(`/feature-flag-settings`);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-2 border-blue-200 hover:border-blue-300"
        >
          <Settings className="h-4 w-4 mr-1" />
          Feature Flags
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Feature Flags
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={handleNavigateToSettings}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Open Feature Flag Settings"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                onClick={resetFlags}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Reset to defaults"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Object.entries(flags).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <Button
                      onClick={() => toggleFlag(key as keyof typeof flags)}
                      variant={value ? "default" : "secondary"}
                      size="sm"
                      className={`h-6 px-2 text-xs font-medium ${
                        value
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {value ? "ON" : "OFF"}
                    </Button>
                  </div>
                ))}
          </div>
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Changes are temporary
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
