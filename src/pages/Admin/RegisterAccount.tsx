import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';
import RegisterExistingGuardianModal from '@/components/Modal/RegisterExistingGuardian';
import { Plus } from 'lucide-react';
import Input from '@/components/Form/Input';
import RadioGroup from '@/components/Form/RadioGroup';
import DateInput from '@/components/Form/DateInput';
import Select from '@/components/Form/Select';
import useGetRoles from '@/hooks/role/useGetRoles';

type Inputs = {
  firstName: string;
  lastName: string;
  preferredName: string;
  nric: string;
  address: string;
  contactNo: string;
  gender: 'Male' | 'Female';
  dateOfBirth: Date;
  email: string
  role: string
};

const RegisterAccount: React.FC = () => {
  const { activeModal, openModal } = useModal();
  const form = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => { console.log(data) }
  const roles = useGetRoles()

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Register Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <Button
                className="bg-sky-600 self-center gap-2"
                onClick={() => openModal('registerExistingGuardian')}
              >
                <Plus />
                Register existing guardian
              </Button>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="m-3">
                  <CardHeader className="bg-sky-400 py-3 text-white font-semibold">
                    Personal Information
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col">
                    <Input
                      label="First Name"
                      name="firstName"
                      form={form}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      form={form}
                    />
                    <Input
                      label="Preferred Name"
                      name="preferredName"
                      form={form}
                    />
                    <Input
                      label="NRIC"
                      name="nric"
                      form={form}
                    />
                    <Input
                      label="Address"
                      name="address"
                      form={form}
                    />
                    <RadioGroup
                      label="Gender"
                      name="gender"
                      form={form}
                      options={['Male', 'Female']}
                    />
                    <DateInput
                      label="Date of Birth"
                      name="dateOfBirth"
                      form={form}
                    />
                  </CardContent>
                </Card>
                <Card className="m-3">
                  <CardHeader className="bg-sky-400 py-3 text-white font-semibold">
                    Account Information
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col">
                    <Input
                      label="Email"
                      name="email"
                      form={form}
                    />
                    <Select
                      label="Role"
                      name="role"
                      form={form}
                      options={roles.data?.map(role => role.roleName) || []}
                    />
                  </CardContent>
                </Card>
                <Button type="submit" className="bg-blue-500 mr-1 ml-3">
                  Send registration link to email
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
      {activeModal.name === 'registerExistingGuardian' && <RegisterExistingGuardianModal />}
    </div>
  );
};

export default RegisterAccount;
