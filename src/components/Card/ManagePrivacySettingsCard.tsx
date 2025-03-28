import useGetSocialHistorySensitiveMapping from "@/hooks/socialHistorySensitiveMapping/useGetSocialHistorySensitiveMapping";
import useUpdateSocialHistorySensitiveMapping from "@/hooks/socialHistorySensitiveMapping/useUpdateSocialHistorySensitiveMapping";
import { convertCamelCaseToLabel } from "@/utils/convertCamelCasetoLabel";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "../ui/card";
import { InfoIcon, SaveIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import RadioGroup from "../Form/RadioGroup";
import { Button } from "../ui/button";

type PrivacySettingsForm = {
  [socialHistory: string]: '0' | '1';
};

const privacySettingsHeaderCols = [
  "Social History",
  "Privacy Setting",
]

const ManagePrivacySettingsCard = () => {
  const { data } = useGetSocialHistorySensitiveMapping()
  const rows = useMemo(() =>
    data
      ?.map(item => ({
        name: item.socialHistoryItem,
        label: convertCamelCaseToLabel(item.socialHistoryItem),
        privacySetting: item.isSensitive ? '1' : '0'
      })), [data]
  );
  const formValues = useMemo(() =>
    data?.reduce((acc, item) => {
      acc[item.socialHistoryItem] = item.isSensitive ? '1' : '0'
      return acc
    }, {} as { [item: string]: '0' | '1' }), [data]
  )

  const form = useForm<PrivacySettingsForm>({ values: formValues as PrivacySettingsForm });
  const { mutate } = useUpdateSocialHistorySensitiveMapping();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const onSubmitPrivacySettings: SubmitHandler<PrivacySettingsForm> = (data) => {
    const socialHistoryMappings = Object.entries(data).map(([socialHistoryItem, isSensitive]) => ({
      socialHistoryItem,
      isSensitive: isSensitive === '1'
    }))
    mutate(socialHistoryMappings)
  };

  return (
    <Card className="m-3">
      <CardHeader className="bg-sky-400 py-3 text-white font-semibold flex flex-row gap-2">
        Manage Privacy Settings
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
          onSubmit={form.handleSubmit(onSubmitPrivacySettings)}
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
              {rows?.map((row) => (
                <TableRow key={row.name} className="odd:bg-slate-100 odd:dark:bg-slate-700">
                  <TableCell className='border'>{row.label}</TableCell>
                  <TableCell>
                    <RadioGroup
                      form={form}
                      name={row.name}
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
  )
}

export default ManagePrivacySettingsCard;