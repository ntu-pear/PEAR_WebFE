import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useCreateRole from "@/hooks/role/useCreateRole";
import Input from "@/components/Form/Input";
import Select from "@/components/Form/Select";
import { fetchAccessLevels, AccessLevel } from "@/api/access_level/access_level.ts";
import { 
  ArrowLeft, 
  ShieldPlus, 
  ShieldCheck, 
  Info, 
  Save, 
  XCircle,
  Lock,
  Loader2
} from "lucide-react";

type RoleForm = {
  roleName: string;
  description: string;
  accessLevelId: string;
};

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<RoleForm>({
    defaultValues: {
      roleName: "",
      description: "",
      accessLevelId: "",
    },
  });

  const { mutate, isPending } = useCreateRole();
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);

  useEffect(() => {
    const loadAccessLevels = async () => {
      try {
        const data = await fetchAccessLevels();
        setAccessLevels(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadAccessLevels();
  }, []);

  const selectedAccessLevelId = form.watch("accessLevelId");
  const selectedAccessLevel = accessLevels.find(
    (level) => level.id === selectedAccessLevelId
  );

  const onSubmit: SubmitHandler<RoleForm> = (data) =>
    mutate({
      roleName: data.roleName.toUpperCase(), // Best practice for system roles
      description: data.description,
      accessLevelId: data.accessLevelId,
    });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Page Header - Matches Workbench Style */}
      <div className="bg-card border-b border-border px-8 py-6 flex flex-col gap-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary font-bold text-[14px] mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-5">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/10">
              <ShieldPlus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Define New Role
              </h1>
              <p className="text-muted-foreground font-medium text-[14px] mt-1">
                Configure global permissions and access tiers for system users.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="p-10 flex-1 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Form Fields */}
          <div className="md:col-span-2">
            <Card className="border border-border shadow-md rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 border-b p-8">
                <CardTitle className="text-lg font-bold">Role Details</CardTitle>
                <CardDescription>Enter the identity and purpose of this security rank.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6">
                    <Input 
                      formReturn={form} 
                      label="Role Name" 
                      name="roleName" 
                      placeholder="e.g. CLINICAL_SUPERVISOR"
                    />
                    <Input 
                      formReturn={form} 
                      label="Description" 
                      name="description" 
                      placeholder="Briefly explain the responsibilities of this role..."
                    />

                    <Select
                      form={form}
                      label="Access Level Policy"
                      name="accessLevelId"
                      options={accessLevels.map((level) => ({
                        value: level.id,
                        name: `${level.levelName} (${level.code})`,
                      }))}
                    />
                  </div>

                  <div className="pt-6 border-t border-border flex items-center gap-3">
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="bg-primary text-primary-foreground px-8 py-6 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                    >
                      {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Create System Role
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-reject font-bold px-6 py-6"
                      onClick={() => navigate("/admin/manage-roles")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Discard
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Policy Preview */}
          <div className="md:col-span-1">
            <Card className="border-dashed border-2 border-border bg-muted/20 rounded-2xl flex flex-col h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Policy Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                {selectedAccessLevel ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                      <p className="text-[12px] font-mono font-bold text-primary uppercase mb-1">
                        Tier {selectedAccessLevel.code}
                      </p>
                      <h4 className="font-bold text-foreground text-lg mb-2">
                        {selectedAccessLevel.levelName}
                      </h4>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {selectedAccessLevel.description}
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground font-medium italic">
                        Assigning this policy will grant users all permissions associated with the {selectedAccessLevel.levelName} tier.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 py-20">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Lock className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-[13px] text-muted-foreground font-medium">
                      Select an Access Level to preview the security policy details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateRole;