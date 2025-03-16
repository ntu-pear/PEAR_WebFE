import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { InfoIcon, SaveIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RadioGroup from "@/components/Form/RadioGroup";

type PrivacySettingsForm = {
  alcoholUse: 'Sensitive' | 'Non-sensitive';
  caffeineUse: 'Sensitive' | 'Non-sensitive';
  diet: 'Sensitive' | 'Non-sensitive';
  drugUse: 'Sensitive' | 'Non-sensitive';
  education: 'Sensitive' | 'Non-sensitive';
  exercise: 'Sensitive' | 'Non-sensitive';
  liveWith: 'Sensitive' | 'Non-sensitive';
  occupation: 'Sensitive' | 'Non-sensitive';
  pet: 'Sensitive' | 'Non-sensitive';
  religion: 'Sensitive' | 'Non-sensitive';
  secondhandSmoker: 'Sensitive' | 'Non-sensitive';
  sexuallyActive: 'Sensitive' | 'Non-sensitive';
  tobaccoUse: 'Sensitive' | 'Non-sensitive';
};

type PrivacyLevelForm = {
  gameTherapist: 'None' | 'Low' | 'Medium' | 'High';
  caregiver: 'None' | 'Low' | 'Medium' | 'High';
  doctor: 'None' | 'Low' | 'Medium' | 'High';
  supervisor: 'None' | 'Low' | 'Medium' | 'High';
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

const ManageSocialHistory: React.FC = () => {
  const navigate = useNavigate();
  const privacySettingsForm = useForm<PrivacySettingsForm>();
  const privacyLevelForm = useForm<PrivacyLevelForm>();
  const onSubmitPrivacySettings: SubmitHandler<PrivacySettingsForm> = (data) => console.log(data);
  const onSubmitPrivacyLevel: SubmitHandler<PrivacyLevelForm> = (data) => console.log(data);
  const [privacySettingsTooltipVisible, setPrivacySettingsTooltipVisible] = useState(false);
  const [privacyLevelTooltipVisible, setPrivacyLevelTooltipVisible] = useState(false);


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
                        <TableRow key={row.name} className="odd:bg-slate-100">
                          <TableCell className='border'>{row.label}</TableCell>
                          <TableCell>
                            <RadioGroup
                              form={privacySettingsForm}
                              name={row.name as keyof PrivacySettingsForm}
                              options={['Sensitive', 'Non-Sensitive']}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <form
                    onSubmit={privacySettingsForm.handleSubmit(onSubmitPrivacySettings)}
                    className="flex flex-col items-center"
                  >
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
                      <div className="absolute bottom-full mb-2 w-96 bg-gray-700 text-white text-xs rounded py-1 px-2">
                        <h1>
                          Select the role(s) allowed to view sensitive and non-sensitive social history information for each privacy level.
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
                    <Button
                      className="bg-sky-600 gap-2 w-auto"
                      onClick={() => navigate("/admin/edit-roles")}
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
