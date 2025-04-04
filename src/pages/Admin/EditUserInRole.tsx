import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router";
import useGetUsers from "@/hooks/admin/useGetUsers";
import { SubmitHandler, useForm } from "react-hook-form";
import useEditUsersInRole from "@/hooks/role/useEditUsersInRole";
import useGetUsersFromRole from "@/hooks/role/useGetUsersFromRole";
import { Role } from "@/api/role/roles";

type Inputs = {
  [key: string]: boolean;
};

const EditUserInRole: React.FC = () => {
  const navigate = useNavigate();
  const {
    state: { role },
  }: { state: { role: Role } } = useLocation();
  const users = useGetUsers();
  const usersInRole = useGetUsersFromRole(role.roleName);
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: usersInRole.data?.reduce(
      (acc, user) => ({ ...acc, [user.id]: true }),
      {}
    ),
  });
  const { mutate } = useEditUsersInRole();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutate({
      roleName: role.roleName,
      userIds: Object.keys(data).filter((key) => data[key]),
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit User in Role</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <Card>
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <ul className="p-4">
                      {users.data?.map((user) => (
                        <li key={user.id} className="text-sm">
                          <input
                            type="checkbox"
                            {...register(user.id)}
                            className="mr-2 mb-2"
                          />
                          {user.nric_FullName}
                        </li>
                      ))}
                    </ul>
                    <div className="px-4 py-2 bg-slate-200 border-t-2 border-slate-300 dark:bg-slate-700">
                      <Button className="bg-blue-500 mr-1">Update</Button>
                      <Button
                        type="button"
                        className="bg-red-500 w-20"
                        onClick={() => navigate(-1)}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EditUserInRole;
