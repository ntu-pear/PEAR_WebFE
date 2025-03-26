import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import useCreateRole from "@/hooks/role/useCreateRole";
import Input from "@/components/Form/Input";
import RadioGroup from "@/components/Form/RadioGroup";

type RoleForm = {
  name: string;
  privacyLevel: '0' | '1' | '2' | '3';
};

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<RoleForm>();
  const { mutate } = useCreateRole();
  const onSubmit: SubmitHandler<RoleForm> = (data) =>
    mutate({ roleName: data.name, privacyLevel: Number(data.privacyLevel) as 0 | 1 | 2 | 3 });

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Input
                  formReturn={form}
                  label="Role Name"
                  name="name"
                />
                <RadioGroup
                  form={form}
                  label="Privacy Level"
                  name="privacyLevel"
                  options={[
                    { label: "None", value: "0" },
                    { label: "Low", value: "1" },
                    { label: "Medium", value: "2" },
                    { label: "High", value: "3" },
                  ]}
                />
                <Button type="submit" className="bg-blue-500 mr-1 mt-3">
                  Create Role
                </Button>
                <Button
                  className="bg-red-500"
                  onClick={() => navigate("/admin/edit-roles")}
                >
                  Cancel
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateRole;
