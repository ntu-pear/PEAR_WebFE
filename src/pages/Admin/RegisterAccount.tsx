import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useForm, SubmitHandler, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';
import RegisterExistingGuardianModal from '@/components/Modal/RegisterExistingGuardian';
import { Plus } from 'lucide-react';

type Inputs = {
  firstName: string;
  lastName: string;
  preferredName: string;
  nric: string;
  address: string;
  contactNo: string;
  gender: 'Male' | 'Female';
  dateOfBirth: Date;
};

const RegisterAccount: React.FC = () => {
  const { activeModal, openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => { }

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
              <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="m-3">
                  <CardHeader className="bg-sky-400 py-3 text-white font-semibold">
                    Personal Information
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col">
                    <Input
                      label="First Name"
                      name="firstName"
                      register={register}
                      errors={errors}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      register={register}
                      errors={errors}
                    />
                    <Input
                      label="Preferred Name"
                      name="preferredName"
                      register={register}
                      errors={errors}
                    />
                    <Input
                      label="NRIC"
                      name="nric"
                      register={register}
                      errors={errors}
                    />
                    <Input
                      label="Address"
                      name="address"
                      register={register}
                      errors={errors}
                    />
                  </CardContent>
                </Card>
                <Card className="m-3">
                  <CardHeader className="bg-sky-400 py-3 text-white font-semibold">
                    Account Information
                  </CardHeader>
                  <CardContent className="py-4 flex justify-between">
                  </CardContent>
                </Card>
              </form>
              <div className="flex justify-between mb-4">

                <div className="w-5/6 flex flex-col">


                </div>
              </div>
              <Button type="submit" className="bg-blue-500 mr-1">
                Send registration link to email
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
      {activeModal.name === 'registerExistingGuardian' && <RegisterExistingGuardianModal />}
    </div>
  );
};

type Props = {
  label: string
  name: keyof Inputs
  errors: FieldErrors<Inputs>
  register: UseFormRegister<Inputs>
}

const Input = ({ label, name, register, errors }: Props) =>
  <div className='pb-2 flex flex-col'>
    <label className='mb-1'>
      {label} <span className="text-red-600">*</span>
    </label>
    <input
      className="border border-gray-300 rounded-md p-2"
      placeholder={label}
      {...register(name, { required: true })}
    />
    {errors.firstName && (
      <p role="alert" className="text-red-600 text-sm">
        The {label} field is required.
      </p>
    )}
  </div>

export default RegisterAccount;
