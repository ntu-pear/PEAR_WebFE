import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import useGetRoles from '@/hooks/useGetRoles';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const EditRoles: React.FC = () => {
  const { data } = useGetRoles()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <Button className='bg-sky-600 self-center' onClick={() => navigate("/Admin/CreateRole")}>Create Role</Button>
              <ul>
                {data?.map((role) =>
                  <li key={role.id}>
                    <Card className='m-3'>
                      <CardHeader className='bg-sky-400 py-3 text-white font-semibold'>Role ID: {role.id}</CardHeader>
                      <CardContent className='py-4 text-xl flex justify-between'>
                        {role.name}
                        <div>
                          <Button className='border-green-500 bg-transparent text-green-500 border-2 mr-1 '>Edit</Button>
                          <Button className='border-red-500 bg-transparent text-red-500 border-2'>Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EditRoles;
