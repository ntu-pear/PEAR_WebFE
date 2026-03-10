import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getMiscSettings, updateMiscSettings, type MiscSettings } from "@/api/admin/config";

const ManageMiscellaneous: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<MiscSettings>({
    SESSION_EXPIRE_MINUTES: 100,
    MAX_PATIENT_PHOTO: 25,
    MAX_ITEMS_TO_RETURN: 100,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getMiscSettings();
        console.log(data)
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
      setForm((prev) => ({ ...prev, [key]: v === "" ? 0 : Number(v) }));
    };

  const validate = () => {
    if (!form.SESSION_EXPIRE_MINUTES || form.SESSION_EXPIRE_MINUTES < 1)
      return "Web Inactivity Timeout must be at least 1 minute.";
    if (!form.MAX_PATIENT_PHOTO || form.MAX_PATIENT_PHOTO < 1)
      return "Maximum No of Photos per Patient must be at least 1.";
    if (!form.MAX_ITEMS_TO_RETURN || form.MAX_ITEMS_TO_RETURN < 1)
      return "Maximum Items to Return must be at least 1.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);

    try {
      await updateMiscSettings(form);
      toast.success("Settings saved.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Card className="ml-4 sm:ml-6 px-4 py-2">
          <CardHeader>
            <div className="space-y-1.5">
              <CardTitle>Manage Miscellaneous</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <Card className="border">
              <CardContent className="pt-6">
                <div className="space-y-5 max-w-4xl">
                  <div className="space-y-2">
                    <Label htmlFor="webTimeout">
                      Web Inactivity Timeout (In Minutes){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="webTimeout"
                      type="number"
                      min={1}
                      value={form.SESSION_EXPIRE_MINUTES}
                      onChange={onChangeNumber("SESSION_EXPIRE_MINUTES")}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPhotos">
                      Maximum No of Photos per Patient{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maxPhotos"
                      type="number"
                      min={1}
                      value={form.MAX_PATIENT_PHOTO}
                      onChange={onChangeNumber("MAX_PATIENT_PHOTO")}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxItems">
                      Maximum Items to Return{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maxItems"
                      type="number"
                      min={1}
                      value={form.MAX_ITEMS_TO_RETURN}
                      onChange={onChangeNumber("MAX_ITEMS_TO_RETURN")}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Button onClick={handleSave} disabled={loading}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageMiscellaneous;