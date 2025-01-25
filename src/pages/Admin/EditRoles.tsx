import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import useGetRoles from '@/hooks/useGetRoles';

const EditRoles: React.FC = () => {
  const { data } = useGetRoles()

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ul>{data?.map((role) => <li key={role.id}>{role.id} {role.name}</li>)}</ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EditRoles;
