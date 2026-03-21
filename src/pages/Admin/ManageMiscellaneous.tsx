import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Settings2, 
  Save, 
  Clock, 
  Image as ImageIcon, 
  Hash, 
  Info,
  Loader2
} from "lucide-react";
import { getMiscSettings, updateMiscSettings, type MiscSettings } from "@/api/admin/config";

const ManageMiscellaneous: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6 flex flex-col gap-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto w-full">
          
          <div className="flex items-center gap-5">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/10">
              <Settings2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                System Configurations
              </h1>
              <p className="text-muted-foreground font-medium text-[14px] mt-1">
                Manage global environment variables and miscellaneous system constraints.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="p-10 flex-1 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Settings Form */}
          <div className="md:col-span-2">
            <Card className="border border-border shadow-md rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b p-8">
                <CardTitle className="text-lg font-bold">Global Parameters</CardTitle>
                <CardDescription>Adjust these values carefully as they affect all system users.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Fetching configurations...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Session Timeout */}
                    <div className="space-y-3">
                      <Label htmlFor="webTimeout" className="text-[14px] font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Web Inactivity Timeout (Minutes)
                      </Label>
                      <Input
                        id="webTimeout"
                        type="number"
                        min={1}
                        className="max-w-md h-12 bg-background border-border rounded-xl focus:ring-primary"
                        value={form.SESSION_EXPIRE_MINUTES}
                        onChange={onChangeNumber("SESSION_EXPIRE_MINUTES")}
                      />
                      <p className="text-[12px] text-muted-foreground italic">Duration before an idle user is automatically logged out.</p>
                    </div>

                    {/* Max Photos */}
                    <div className="space-y-3">
                      <Label htmlFor="maxPhotos" className="text-[14px] font-bold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        Max Photos per Patient
                      </Label>
                      <Input
                        id="maxPhotos"
                        type="number"
                        min={1}
                        className="max-w-md h-12 bg-background border-border rounded-xl focus:ring-primary"
                        value={form.MAX_PATIENT_PHOTO}
                        onChange={onChangeNumber("MAX_PATIENT_PHOTO")}
                      />
                      <p className="text-[12px] text-muted-foreground italic">Limits the storage footprint per patient record.</p>
                    </div>

                    {/* Max Items */}
                    <div className="space-y-3">
                      <Label htmlFor="maxItems" className="text-[14px] font-bold flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        Maximum Items to Return
                      </Label>
                      <Input
                        id="maxItems"
                        type="number"
                        min={1}
                        className="max-w-md h-12 bg-background border-border rounded-xl focus:ring-primary"
                        value={form.MAX_ITEMS_TO_RETURN}
                        onChange={onChangeNumber("MAX_ITEMS_TO_RETURN")}
                      />
                      <p className="text-[12px] text-muted-foreground italic">Controls the pagination and API result limit for tables.</p>
                    </div>

                    <div className="pt-6 border-t border-border flex items-center gap-4">
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving || loading}
                        className="bg-primary text-primary-foreground px-10 py-6 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                      >
                        {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save System Changes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Context/Help */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              <Card className="border-dashed border-2 border-border bg-muted/20 rounded-2xl">
                <CardHeader className="p-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" /> Administration Tip
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Changes to <strong>Inactivity Timeout</strong> will apply to users upon their next login session. 
                  </p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Setting <strong>Max Items</strong> too high may result in slower table loading times across the dashboard.
                  </p>
                </CardContent>
              </Card>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="text-[12px] font-bold text-primary uppercase tracking-widest mb-2">Audit Notice</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  All changes to these parameters are logged under Admin Audit Logs for security and compliance tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageMiscellaneous;