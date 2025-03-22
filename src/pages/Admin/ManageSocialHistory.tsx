import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InfoIcon, SaveIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RadioGroup from "@/components/Form/RadioGroup";
import useGetRoles from "@/hooks/role/useGetRoles";
import useUpdateRolePrivacyLevel from "@/hooks/role/useUpdateRolesPrivacyLevel";
import { toast } from "sonner";

type PrivacySetting = 'Sensitive' | 'Non-sensitive';

type PrivacySettingsForm = {
  alcoholUse: PrivacySetting;
  caffeineUse: PrivacySetting;
  diet: PrivacySetting;
  drugUse: PrivacySetting;
  education: PrivacySetting;
  exercise: PrivacySetting;
  liveWith: PrivacySetting;
  occupation: PrivacySetting;
  pet: PrivacySetting;
  religion: PrivacySetting;
  secondhandSmoker: PrivacySetting;
  sexuallyActive: PrivacySetting;
  tobaccoUse: PrivacySetting;
};

type PrivacyLevel = '0' | '1' | '2' | '3';

type PrivacyLevelForm = {
  [roleName: string]: PrivacyLevel;
};

const privacySettingsHeaderCols = [
  "Social History",
  "Privacy Setting",
]

const privacySettingsRows = [
  { name: 'alcoholUse', label: 'Alcohol Use' },
  { name: 'caffeineUse', label: 'Caffeine Use' },
  { name: 'diet', label: 'Diet' },
  { name: 'drugUse', label: 'Drug Use' },
  { name: 'education', label: 'Education' },
  { name: 'exercise', label: 'Exercise' },
  { name: 'liveWith', label: 'Live With' },
  { name: 'occupation', label: 'Occupation' },
  { name: 'pet', label: 'Pet' },
  { name: 'religion', label: 'Religion' },
  { name: 'secondhandSmoker', label: 'Secondhand Smoker' },
  { name: 'sexuallyActive', label: 'Sexually Active' },
  { name: 'tobaccoUse', label: 'Tobacco Use' },
]

const privacyLevelHeaderCols = [
  "Role",
  "Privacy Level",
]

const ManageSocialHistory: React.FC = () => {
  const roles = useGetRoles()
  const privacyLevelRows = useMemo(() =>
    roles.data
      ?.filter(role => role.roleName !== 'ADMIN' && role.roleName !== 'GUARDIAN')
      .map(role => ({
        name: role.roleName,
        label: role.roleName,
        id: role.id, privacyLevel:
          role.privacyLevelSensitive
      })), [roles.data]
  );
  const rolesPrivacyLevel = useMemo(() =>
    roles.data?.reduce((acc, role) => {
      acc[role.roleName] = role.privacyLevelSensitive.toString() as '0' | '1' | '2' | '3'
      return acc
    }, {} as { [roleName: string]: '0' | '1' | '2' | '3' }), [roles.data]
  )
  const privacySettingsForm = useForm<PrivacySettingsForm>();
  const privacyLevelForm = useForm<PrivacyLevelForm>({ values: rolesPrivacyLevel as PrivacyLevelForm });
  const updateRolePrivacyLevel = useUpdateRolePrivacyLevel();
  const [privacySettingsTooltipVisible, setPrivacySettingsTooltipVisible] = useState(false);
  const [privacyLevelTooltipVisible, setPrivacyLevelTooltipVisible] = useState(false);
  const onSubmitPrivacySettings: SubmitHandler<PrivacySettingsForm> = (data) => console.log(data);

  const onSubmitPrivacyLevel: SubmitHandler<PrivacyLevelForm> = (data) => {
    if (!privacyLevelRows) return
    let isChanged = false
    for (const row of privacyLevelRows) {
      const newPrivacyLevel = Number(data[row.name])
      if (newPrivacyLevel !== row.privacyLevel) {
        isChanged = true
        updateRolePrivacyLevel.mutate({
          roleId: row.id,
          roleName: row.name,
          privacyLevelSensitive: newPrivacyLevel as 0 | 1 | 2 | 3
        })
      }
    }
    if (!isChanged) toast.error('No changes made to role privacy levels')
  };

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Social History
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <Card className="m-3">
                <CardHeader className="bg-sky-400 py-3 text-white font-semibold flex flex-row gap-2">
                  Manage Privacy Settings
                  <div className="relative flex items-center">
                    <div
                      className="cursor-pointer"
                      onMouseEnter={() => setPrivacySettingsTooltipVisible(true)}
                      onMouseLeave={() => setPrivacySettingsTooltipVisible(false)}
                    >
                      <InfoIcon />
                    </div>
                    {privacySettingsTooltipVisible && (
                      <div className="absolute bottom-full mb-2 w-96 bg-gray-700 text-white text-xs rounded py-1 px-2">
                        <h1>
                          Configure sensitivity of each social history information.
                        </h1>
                        <h1>
                          Non-sensitive social history information can be view by Caregivers, Doctors and Supervisors regardless of privacy level.
                        </h1>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-4 flex flex-col">
                  <form
                    onSubmit={privacySettingsForm.handleSubmit(onSubmitPrivacySettings)}
                    className="flex flex-col items-center"
                  >
                    <Table className="border mb-2">
                      <TableHeader>
                        <TableRow>
                          {privacySettingsHeaderCols.map((col) => (
                            <TableHead className='border' key={col}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {privacySettingsRows.map((row) => (
                          <TableRow key={row.name} className="odd:bg-slate-100 odd:dark:bg-slate-700">
                            <TableCell className='border'>{row.label}</TableCell>
                            <TableCell>
                              <RadioGroup
                                form={privacySettingsForm}
                                name={row.name as keyof PrivacySettingsForm}
                                options={[
                                  { label: 'Sensitive', value: '1' },
                                  { label: 'Non- Sensitive', value: '0' },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button className="bg-sky-600 gap-2 w-auto">
                      <SaveIcon />
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="m-3">
                <CardHeader className="bg-sky-400 py-3 text-white font-semibold flex flex-row gap-2">
                  Manage Privacy Level
                  <div className="relative flex items-center">
                    <div
                      className="cursor-pointer"
                      onMouseEnter={() => setPrivacyLevelTooltipVisible(true)}
                      onMouseLeave={() => setPrivacyLevelTooltipVisible(false)}
                    >
                      <InfoIcon />
                    </div>
                    {privacyLevelTooltipVisible && (
                      <div className="absolute bottom-full mb-2 w-40 bg-gray-700 text-white text-xs rounded py-1 px-2">
                        <h1>
                          Select the privacy level of each role.
                        </h1>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-4 flex flex-col">
                  <form
                    onSubmit={privacyLevelForm.handleSubmit(onSubmitPrivacyLevel)}
                    className="flex flex-col items-center"
                  >
                    <Table className="border mb-2">
                      <TableHeader>
                        <TableRow>
                          {privacyLevelHeaderCols.map((col) => (
                            <TableHead className='border' key={col}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {privacyLevelRows?.map((row) => (
                          <TableRow key={row.name} className="odd:bg-slate-100 odd:dark:bg-slate-700">
                            <TableCell className='border'>{row.label}</TableCell>
                            <TableCell>
                              <RadioGroup
                                form={privacyLevelForm}
                                name={row.name}
                                options={[
                                  { label: 'None', value: '0' },
                                  { label: 'Low', value: '1' },
                                  { label: 'Medium', value: '2' },
                                  { label: 'High', value: '3' },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button
                      className="bg-sky-600 gap-2 w-auto"
                    >
                      <SaveIcon />
                      Save Changes
                    </Button>
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

export default ManageSocialHistory;
