import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import Input from '@/components/Form/Input';
import RadioGroup from '@/components/Form/RadioGroup';
import DateInput from '@/components/Form/DateInput';
import Select from '@/components/Form/Select';
import useGetRoles from '@/hooks/role/useGetRoles';
import useVerifyUser from '@/hooks/user/useVerifyUser';

type Inputs = {
  firstName: string;
  lastName: string;
  preferredName: string;
  nric: string;
  address: string;
  contactNo: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  email: string
  role: string
  password: string
  confirmPassword: string
};

const VerifyAccount: React.FC = () => {
  const form = useForm<Inputs>();
  const { mutate } = useVerifyUser()
  const roles = useGetRoles()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const url = window.location.href;
    const token = url.substring(url.lastIndexOf('/') + 1);

    mutate({
      user: {
        nric_FullName: `${data.firstName} ${data.lastName}`,
        nric_Address: data.address,
        nric_DateOfBirth: data.dateOfBirth,
        nric_Gender: data.gender.charAt(0) as "F" | "M",
        contactNo: data.contactNo,
        email: data.email,
        roleName: data.role,
        nric: data.nric,
        password: data.password,
        confirm_Password: data.confirmPassword
      },
      token
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Verify Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="m-3">
                  <CardHeader className="bg-sky-400 py-3 text-white font-semibold">
                    Personal Information
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col">
                    <Input
                      label="First Name"
                      name="firstName"
                      formReturn={form}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      formReturn={form}
                    />
                    <Input
                      label="Preferred Name"
                      name="preferredName"
                      formReturn={form}
                    />
                    <Input
                      label="NRIC"
                      name="nric"
                      formReturn={form}
                      validation={{
                        pattern: {
                          value: /^[STGM]\d{7}[A-Z]$/,
                          message: 'NRIC must be 9 characters in length and starts with character S,T,G,M'
                        }
                      }}
                    />
                    <Input
                      label="Address"
                      name="address"
                      formReturn={form}
                    />
                    <Input
                      label="Contact No."
                      name="contactNo"
                      formReturn={form}
                      validation={{
                        pattern: {
                          value: /^[689]\d{7}$/,
                          message: 'Contact No. must have 8 digits in length and start with digit 6, 8 or 9'
                        }
                      }}
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
                      formReturn={form}
                      validation={{
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: 'The Email field is not a valid email address'
                        }
                      }}
                    />
                    <Select
                      label="Role"
                      name="role"
                      form={form}
                      options={roles.data?.map(role => role.roleName) || []}
                    />
                    <Input
                      type='password'
                      label="Password"
                      name="password"
                      formReturn={form}
                    />
                    <Input
                      type='password'
                      label="Confirm Password"
                      name="confirmPassword"
                      formReturn={form}
                      validation={{
                        validate: (val: string) => {
                          if (val !== form.watch('password')) {
                            return 'Passwords do not match'
                          }
                        }
                      }}
                    />
                  </CardContent>
                </Card>
                <Button type="submit" className="bg-blue-500 mr-1 ml-3">
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default VerifyAccount;
