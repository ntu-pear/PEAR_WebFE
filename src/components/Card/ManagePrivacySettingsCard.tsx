import useGetSocialHistorySensitiveMapping from "@/hooks/socialHistorySensitiveMapping/useGetSocialHistorySensitiveMapping";
import useUpdateSocialHistorySensitiveMapping from "@/hooks/socialHistorySensitiveMapping/useUpdateSocialHistorySensitiveMapping";
import { convertCamelCaseToLabel } from "@/utils/convertCamelCasetoLabel";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "../ui/card";
import { InfoIcon, SaveIcon, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import RadioGroup from "../Form/RadioGroup";
import { Button } from "../ui/button";
import { toast } from "sonner";



type PrivacySettingsForm = {
  [socialHistory: string]: "0" | "1";
};

type SortKey = "socialHistory" | "privacy";
type SortDir = "asc" | "desc";

const ManagePrivacySettingsCard = () => {
  const { data } = useGetSocialHistorySensitiveMapping();
  const { mutate } = useUpdateSocialHistorySensitiveMapping();

  const [tooltipVisible, setTooltipVisible] = useState(false);

  // NEW: sort state
  const [sortKey, setSortKey] = useState<SortKey>("socialHistory");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const baseRows = useMemo(
    () =>
      data?.map((item) => ({
        name: item.socialHistoryItem, // key used by react-hook-form
        label: convertCamelCaseToLabel(item.socialHistoryItem),
        // store as string to match your form values
        privacySetting: item.isSensitive ? ("1" as const) : ("0" as const),
      })) ?? [],
    [data]
  );

  // form default values
  const formValues = useMemo(
    () =>
      (data?.reduce((acc, item) => {
        acc[item.socialHistoryItem] = item.isSensitive ? "1" : "0";
        return acc;
      }, {} as { [item: string]: "0" | "1" })) ?? {},
    [data]
  );

  const form = useForm<PrivacySettingsForm>({ values: formValues as PrivacySettingsForm });

  // NEW: sorted rows
  const rows = useMemo(() => {
    const copied = [...baseRows];

    copied.sort((a, b) => {
      let cmp = 0;

      if (sortKey === "socialHistory") {
        // Sort by label (what user sees); tie-break by name
        cmp = a.label.localeCompare(b.label) || a.name.localeCompare(b.name);
      } else {
        // Sort by privacy: Sensitive (1) vs Non-sensitive (0)
        // If you want Sensitive first in asc, use b - a. For Non-sensitive first, use a - b.
        const av = Number(a.privacySetting);
        const bv = Number(b.privacySetting);
        cmp = av - bv; // asc: Non-sensitive (0) first, Sensitive (1) second
        // Tie-break by label
        if (cmp === 0) cmp = a.label.localeCompare(b.label);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copied;
  }, [baseRows, sortKey, sortDir]);

  // NEW: click handler for header sorting
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ active }: { active: boolean }) => {
    if (!active) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

const onSubmitPrivacySettings: SubmitHandler<PrivacySettingsForm> = (vals) => {
  if (!rows) return;

  let isChanged = false;

  for (const row of rows) {
    const newSetting = vals[row.name]; // "0" | "1"
    if (newSetting !== row.privacySetting) {
      isChanged = true;
    }
  }

  if (!isChanged) {
    toast.error("No changes made to privacy settings");
    return;
  }

  // Only send changed rows (same pattern as role access level page)
  const changedMappings = rows
    .filter((row) => vals[row.name] !== row.privacySetting)
    .map((row) => ({
      socialHistoryItem: row.name,
      isSensitive: vals[row.name] === "1",
    }));

  mutate(changedMappings);
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
              <h1>Configure sensitivity of each social history information.</h1>
              <h1>
                Non-sensitive social history information can be view by Caregivers, Doctors and
                Supervisors regardless of privacy level.
              </h1>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-4 flex flex-col">
        <form onSubmit={form.handleSubmit(onSubmitPrivacySettings)} className="flex flex-col items-center">
          <Table className="border mb-2">
            <TableHeader>
              <TableRow>
                <TableHead
                className="border cursor-pointer select-none"
                onClick={() => toggleSort("socialHistory")}
              >
                <div className="flex items-center space-x-1">
                  <span>Social History</span>
                  <div className="flex flex-col">
                    {sortKey === "socialHistory" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </TableHead>
              <TableHead
                  className="border cursor-pointer select-none"
                  onClick={() => toggleSort("privacy")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Privacy Setting</span>
                    <div className="flex flex-col">
                      {sortKey === "privacy" ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name} className="odd:bg-slate-100 odd:dark:bg-slate-700">
                  <TableCell className="border">{row.label}</TableCell>
                  <TableCell>
                    <RadioGroup
                      form={form}
                      name={row.name}
                      options={[
                        { label: "Sensitive", value: "1" },
                        { label: "Non-Sensitive", value: "0" },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button className="bg-sky-600 gap-2 w-auto" type="submit">
            <SaveIcon />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManagePrivacySettingsCard;
