import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Save,
  Clock,
  Image as ImageIcon,
  Hash,
  Info,
  Loader2,
} from "lucide-react";
import {
  getMiscSettings,
  updateMiscSettings,
  type MiscSettings,
} from "@/api/admin/config";

const ManageMiscellaneous: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<MiscSettings>({
    SESSION_EXPIRE_MINUTES: 100,
    MAX_PATIENT_PHOTO: 25,
    MAX_ITEMS_TO_RETURN: 100,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getMiscSettings();
        setForm(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChangeNumber =
    (key: keyof MiscSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: v === "" ? 0 : Number(v),
      }));
    };

  const validate = () => {
    if (!form.SESSION_EXPIRE_MINUTES || form.SESSION_EXPIRE_MINUTES < 1) {
      return "Web Inactivity Timeout must be at least 1 minute.";
    }
    if (!form.MAX_PATIENT_PHOTO || form.MAX_PATIENT_PHOTO < 1) {
      return "Maximum No of Photos per Patient must be at least 1.";
    }
    if (!form.MAX_ITEMS_TO_RETURN || form.MAX_ITEMS_TO_RETURN < 1) {
      return "Maximum Items to Return must be at least 1.";
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      return toast.error(err);
    }

    setIsSaving(true);
    try {
      await updateMiscSettings(form);
      toast.success("System configurations updated successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const settingRows = [
    {
      key: "SESSION_EXPIRE_MINUTES" as keyof MiscSettings,
      id: "webTimeout",
      label: "Web Inactivity Timeout",
      description:
        "Duration before an idle user is automatically logged out.",
      icon: Clock,
      value: form.SESSION_EXPIRE_MINUTES,
    },
    {
      key: "MAX_PATIENT_PHOTO" as keyof MiscSettings,
      id: "maxPhotos",
      label: "Max Photos per Patient",
      description:
        "Limits the storage footprint per patient record.",
      icon: ImageIcon,
      value: form.MAX_PATIENT_PHOTO,
    },
    {
      key: "MAX_ITEMS_TO_RETURN" as keyof MiscSettings,
      id: "maxItems",
      label: "Maximum Items to Return",
      description:
        "Controls the pagination and API result limit for tables.",
      icon: Hash,
      value: form.MAX_ITEMS_TO_RETURN,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-gray-900">
              System Configurations
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage global environment variables and miscellaneous system
            constraints across the application.
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
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                <li>
                  Changes to inactivity timeout will apply to users on their
                  next login session
                </li>
                <li>
                  Setting maximum items too high may result in slower table
                  loading performance
                </li>
                <li>
                  All configuration updates are logged for security and audit
                  tracking
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Parameters
              </CardTitle>
              <Button
                onClick={handleSave}
                disabled={isSaving || loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Update these values carefully, as they affect application-wide
              behavior for all users.
            </p>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">
                    Fetching configurations...
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {settingRows.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border gap-6"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-700" />
                          <Label
                            htmlFor={item.id}
                            className="font-semibold text-gray-900"
                          >
                            {item.label}
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="w-[140px] shrink-0">
                        <Input
                          id={item.id}
                          type="number"
                          min={1}
                          value={item.value}
                          onChange={onChangeNumber(item.key)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-sm text-gray-500">
                    These settings define key operational constraints and system
                    defaults used across the application.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageMiscellaneous;