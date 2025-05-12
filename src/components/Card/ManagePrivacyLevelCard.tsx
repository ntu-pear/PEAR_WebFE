import useGetRoles from "@/hooks/role/useGetRoles";
import useUpdateRolePrivacyLevel from "@/hooks/role/useUpdateRolesAccessLevel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoIcon, SaveIcon } from "lucide-react";
import RadioGroup from "../Form/RadioGroup";
import { Button } from "../ui/button";

type AccessLevel = '0' | '1' | '2' | '3';

type AccessLevelForm = {
  [roleName: string]: AccessLevel;
};

const privacyLevelHeaderCols = [
  "Role",
  "Access Level",
]

const ManageAccessLevelCard = () => {
  const { data } = useGetRoles()
  const rows = useMemo(() =>
    data
      ?.filter(role => role.roleName !== 'ADMIN' && role.roleName !== 'GUARDIAN')
      .map(role => ({
        name: role.roleName,
        label: role.roleName,
        id: role.id, privacyLevel:
          role.accessLevelSensitive
      })), [data]
  );
  const formValues = useMemo(() =>
    data?.reduce((acc, role) => {
      acc[role.roleName] = role.accessLevelSensitive.toString() as AccessLevel
      return acc
    }, {} as { [roleName: string]: AccessLevel }), [data]
  )

  const form = useForm<AccessLevelForm>({ values: formValues as AccessLevelForm });
  const updateRolePrivacyLevel = useUpdateRolePrivacyLevel();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const onSubmitPrivacyLevel: SubmitHandler<AccessLevelForm> = (data) => {
    if (!rows) return
    let isChanged = false
    for (const row of rows) {
      const newPrivacyLevel = Number(data[row.name])
      if (newPrivacyLevel !== row.privacyLevel) {
        isChanged = true
        updateRolePrivacyLevel.mutate({
          roleId: row.id,
          roleName: row.name,
          accessLevelSensitive: newPrivacyLevel as 0 | 1 | 2 | 3
        })
      }
    }
    if (!isChanged) toast.error('No changes made to role privacy levels')
  };

  return (
    <Card className="m-3">
      <CardHeader className="bg-sky-400 py-3 text-white font-semibold flex flex-row gap-2">
        Manage Access Level
        <div className="relative flex items-center">
          <div
            className="cursor-pointer"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            <InfoIcon />
          </div>
          {tooltipVisible && (
            <div className="absolute bottom-full mb-2 w-96 bg-gray-700 text-white text-xs rounded py-1 px-2">
              <h1>
                Select the access level of each role. The access level will allow a role to view senstive informaton of patients of equal or lower privacy level.
              </h1>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-4 flex flex-col">
        <form
          onSubmit={form.handleSubmit(onSubmitPrivacyLevel)}
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
              {rows?.map((row) => (
                <TableRow key={row.name} className="odd:bg-slate-100 odd:dark:bg-slate-700">
                  <TableCell className='border'>{row.label}</TableCell>
                  <TableCell>
                    <RadioGroup
                      form={form}
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
  )
}

export default ManageAccessLevelCard;