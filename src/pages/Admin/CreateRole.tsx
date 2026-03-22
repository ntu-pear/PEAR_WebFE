import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useCreateRole from "@/hooks/role/useCreateRole";
import Input from "@/components/Form/Input";
import Select from "@/components/Form/Select";
import { fetchAccessLevels, AccessLevel } from "@/api/access_level/access_level";
import {
  ArrowLeft,
  ShieldCheck,
  Info,
  Save,
  XCircle,
  Lock,
  Loader2,
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
      roleName: data.roleName.toUpperCase(),
      description: data.description,
      accessLevelId: data.accessLevelId,
    });

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start gap-4 mb-8">
          <div className="flex-1 min-w-0 px-4">
            <h1 className="text-3xl font-semibold">Create role</h1>
            <p className="text-sm text-muted-foreground">
              Configure role details and assign an access level.
            </p>
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle>Role details</CardTitle>
                <CardDescription>
                  Enter the role name, description, and access level assignment.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6">
                    <Input
                      formReturn={form}
                      label="Role name"
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
                      label="Access level"
                      name="accessLevelId"
                      options={accessLevels.map((level) => ({
                        value: level.id,
                        name: `${level.levelName} (${level.code})`,
                      }))}
                    />
                  </div>

                  <div className="pt-6 border-t border-border flex items-center gap-3">
                    <Button type="submit" disabled={isPending} size="sm">
                      {isPending ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Create role
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-accent"
                      onClick={() => navigate("/admin/edit-roles")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Discard
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card h-full flex flex-col">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <CardTitle>Policy preview</CardTitle>
                </div>
                <CardDescription>
                  Review the selected access level before creating the role.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 flex-1">
                {selectedAccessLevel ? (
                  <div className="space-y-4">
                    <div className="border border-border rounded-xl bg-muted/20 p-5">
                      <p className="text-sm text-muted-foreground">
                        {selectedAccessLevel.code}
                      </p>
                      <h4 className="text-sm font-medium text-foreground mt-1">
                        {selectedAccessLevel.levelName}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        {selectedAccessLevel.description}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                      <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Assigning this policy will grant users permissions associated with the{" "}
                        {selectedAccessLevel.levelName} access level.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Lock className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select an access level to preview the policy details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateRole;