import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import useCreateRole from '@/hooks/role/useCreateRole';

type RoleForm = {
  name: string;
};

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleForm>();
  const { mutate } = useCreateRole();
  const onSubmit: SubmitHandler<RoleForm> = (data) => mutate(data.name);

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex justify-between mb-4">
                  <label>Role Name</label>
                  <div className="w-5/6 flex flex-col">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md p-1"
                      {...register('name', { required: true })}
                    />
                    {errors.name && (
                      <p role="alert" className="text-red-600 text-sm">
                        The Role Name field is required.
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="bg-blue-500 mr-1">
                  Create Role
                </Button>
                <Button
                  className="bg-red-500"
                  onClick={() => navigate('/admin/edit-roles')}
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
