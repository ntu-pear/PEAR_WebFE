import useGetRoles from "@/hooks/role/useGetRoles";
import useUpdateRolePrivacyLevel from "@/hooks/role/useUpdateRolesAccessLevel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoIcon, SaveIcon, ShieldCheck } from "lucide-react";
import RadioGroup from "../Form/RadioGroup";
import { Button } from "../ui/button";

// Updated type to match your string codes
type AccessLevelCode = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

type AccessLevelForm = {
  [roleName: string]: AccessLevelCode;
};

const privacyLevelHeaderCols = ["Role", "Access Level"];

const ManageAccessLevelCard = () => {
  const { data, refetch } = useGetRoles();

  // 1. Prepare Rows for display and comparison
  const rows = useMemo(() =>
    data
      ?.filter(role => role.roleName !== 'ADMIN' && role.roleName !== 'GUARDIAN')
      .map(role => ({
        name: role.roleName,
        label: role.roleName,
        id: role.id,
        // Match this exactly with the form data
        privacyLevel: role.accessLevel.code as AccessLevelCode 
      })), [data]
  );

  // 2. Map formValues to use the string code (e.g., 'LOW')
  const formValues = useMemo(() =>
    data?.reduce((acc, role) => {
      acc[role.roleName] = role.accessLevel.code as AccessLevelCode;
      return acc;
    }, {} as AccessLevelForm), [data]
  );

  // Using 'values' prop ensures the form updates when data arrives
  const form = useForm<AccessLevelForm>({ values: formValues });
  const updateRolePrivacyLevel = useUpdateRolePrivacyLevel();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const onSubmitPrivacyLevel: SubmitHandler<AccessLevelForm> = (formData) => {
    if (!rows) return;
    let isChanged = false;

    for (const row of rows) {
      const newCode = formData[row.name];
      
      // Compare the new string code with the old string code
      if (newCode !== row.privacyLevel) {
        isChanged = true;
        updateRolePrivacyLevel.mutate({
          roleId: row.id,
          roleName: row.name,
          // Ensure your mutation/API accepts the code string or map it to 0-3 if needed
          accessLevelSensitive: newCode as any 
        }, {
          onSuccess: () => refetch()
        });
      }
    }

    if (!isChanged) toast.error('No changes made to role privacy levels');
    else toast.success('Security configuration updated');
  };

  return (
    <Card className="m-3 border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-sky-500 py-4 text-white font-semibold flex flex-row items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        Manage Access Level
        <div className="relative flex items-center">
          <div
            className="cursor-help opacity-80 hover:opacity-100 transition-opacity"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            <InfoIcon className="h-4 w-4" />
          </div>
          {tooltipVisible && (
            <div className="absolute left-0 bottom-full mb-2 w-80 bg-slate-800 text-white text-[11px] rounded-lg py-2 px-3 shadow-xl z-50">
              <p>Select the access level for each role. This determines the sensitivity of patient information the role is permitted to view.</p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-6 bg-white">
        <form
          onSubmit={form.handleSubmit(onSubmitPrivacyLevel)}
          className="flex flex-col items-center"
        >
          <Table className="border rounded-lg overflow-hidden mb-6">
            <TableHeader className="bg-slate-50">
              <TableRow>
                {privacyLevelHeaderCols.map((col) => (
                  <TableHead className='font-bold text-slate-600' key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows?.map((row) => (
                <TableRow key={row.name} className="hover:bg-slate-50 transition-colors">
                  <TableCell className='font-medium text-slate-700'>{row.label}</TableCell>
                  <TableCell>
                    <RadioGroup
                      form={form}
                      name={row.name}
                      options={[
                        { label: 'None', value: 'NONE' },
                        { label: 'Low', value: 'LOW' },
                        { label: 'Medium', value: 'MEDIUM' },
                        { label: 'High', value: 'HIGH' },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Button className="bg-sky-600 hover:bg-sky-700 px-8 py-6 rounded-xl shadow-lg shadow-sky-100">
            <SaveIcon className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ManageAccessLevelCard;