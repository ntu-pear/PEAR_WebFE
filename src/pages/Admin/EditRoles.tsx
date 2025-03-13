import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useGetRoles from "@/hooks/role/useGetRoles";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useModal } from "@/hooks/useModal";
import DeleteRoleModal from "@/components/Modal/Delete/DeleteRoleModal";

const EditRoles: React.FC = () => {
  const { data } = useGetRoles();
  const navigate = useNavigate();
  const { activeModal, openModal } = useModal();

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <Button
                className="bg-sky-600 self-center"
                onClick={() => navigate("/admin/create-role")}
              >
                Create Role
              </Button>
              <ul>
                {data?.map((role) => (
                  <li key={role.id}>
                    <Card className="m-3">
                      <CardHeader className="bg-sky-400 py-3 text-white font-semibold">
                        Role ID: {role.id}
                      </CardHeader>
                      <CardContent className="py-4 text-xl flex justify-between">
                        {role.roleName}
                        <div>
                          <Button
                            className="border-green-500 bg-transparent text-green-500 border-2 mr-1"
                            onClick={() =>
                              navigate(`/admin/edit-role/${role.id}`, {
                                state: { role },
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            className="border-red-500 bg-transparent text-red-500 border-2"
                            onClick={() => openModal("deleteRole", { role })}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
      {activeModal.name === "deleteRole" && <DeleteRoleModal />}
    </div>
  );
};

export default EditRoles;
