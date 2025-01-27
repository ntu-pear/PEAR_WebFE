import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router';
import useGetUsersFromRole from '@/hooks/user/useGetUsersFromRole';
import { convertToLowerCamelCase } from '@/utils/convertToLowerCamelCase';
import { UserRole } from '@/mocks/mockRoles';

const EditRole: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { role: { name, id } } = location.state
  const { data } = useGetUsersFromRole(convertToLowerCamelCase(name) as UserRole)

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Role</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <div className='flex justify-between mb-1 h-10 items-center'>
                <label>Id</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 w-5/6 bg-slate-200 h-full"
                  value={id}
                  readOnly
                />
              </div>
              <div className='flex justify-between mb-4 h-10 items-center'>
                <label>Role Name</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 w-5/6 bg-slate-200 h-full"
                  value={name}
                  readOnly
                />
              </div>
              <Button className='bg-red-500 w-20 mb-2' onClick={() => navigate("/Admin/EditRoles")}>Back</Button>
              <Card className='border border-blue-400'>
                <CardHeader className='bg-blue-400 text-white'>
                  <CardTitle>Users in this role</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className='p-4'>
                    {data?.map((user) => (<li key={user} className='text-xl'>{user}</li>))}
                  </ul>
                  <div className='bg-slate-200 py-2 px-4 border-t-2 border-slate-300'>
                    <Button className='bg-blue-500'>Add or Remove Users</Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </main>
      </div>
    </div >
  );
};

export default EditRole;
