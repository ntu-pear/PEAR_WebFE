import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  fetchSocialHistoryTD,
  SocialHistoryTD,
} from "@/api/patients/socialHistory";
import { toast } from "sonner";
import { FilePenLine, PlusCircle, Info } from "lucide-react";
import { fetchPatientPrivacyLevel } from "@/api/patients/privacyLevel";
import { convertPrivacyLevel } from "@/utils/convertPrivacyLevel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const SocialHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [socialHistory, setSocialHistory] = useState<Record<string, string> | null>(
    null
  );
  const [accessLevelSensitive, setAccessLevelSensitive] = useState<
    number | null
  >(null);

  const displayValue = (
    value: string | number | null | undefined
  ): string => {
    if (value === -1 || value === "-1" || value === "-" || value === "") {
      return "NOT SHOWN";
    }

    if (value === null || value === undefined) {
      return "NOT AVAILABLE";
    }

    return String(value);
  };

  const handleFetchSocialHistory = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedSocialHistory: SocialHistoryTD = await fetchSocialHistoryTD(
        Number(id)
      );

      const processedSocialHistory: Record<string, string> = {};
      socialHistoryColumns.forEach((col) => {
        processedSocialHistory[col.key] = displayValue(fetchedSocialHistory[col.key as keyof SocialHistoryTD])
      })

      setSocialHistory(processedSocialHistory);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch patient social history");
      }
    }
  };

  const refreshPatientPrivacyLevel = async () => {
    if (isNaN(Number(id))) return;
    const response = await fetchPatientPrivacyLevel(Number(id));
    setAccessLevelSensitive(response.accessLevelSensitive);
  };

  useEffect(() => {
    handleFetchSocialHistory();
    refreshPatientPrivacyLevel();
  }, []);

  const socialHistoryColumns = [
    {
      key: "accessLevelSensitive",
      header: "Privacy Level",
      customValue: accessLevelSensitive,
    },
    { key: "alcoholUse", header: "Alcohol Use" },
    { key: "caffeineUse", header: "Caffeine Use" },
    { key: "diet", header: "Diet" },
    { key: "drugUse", header: "Drug Use" },
    { key: "education", header: "Education" },
    { key: "exercise", header: "Exercise" },
    { key: "liveWith", header: "Live With" },
    { key: "occupation", header: "Occupation" },
    { key: "pet", header: "Pet" },
    { key: "religion", header: "Religion" },
    { key: "secondhandSmoker", header: "Secondhand Smoker" },
    { key: "sexuallyActive", header: "Sexually Active" },
    { key: "tobaccoUse", header: "Tobacco Use" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Social History</span>

            {!socialHistory
              ? (currentUser?.roleName === "SUPERVISOR" || currentUser?.userId === patientAllocation?.guardianApplicationUserId) && (
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() =>
                    openModal("addSocialHistory", {
                      patientId: String(id),
                      submitterId: currentUser?.userId,
                      refreshData: handleFetchSocialHistory,
                      refreshPrivacyLevel: refreshPatientPrivacyLevel
                    })
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add
                  </span>
                </Button>
              )
              : (currentUser?.roleName === "SUPERVISOR" || currentUser?.userId === patientAllocation?.guardianApplicationUserId) && (
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() =>
                    openModal("editSocialHistory", {
                      patientId: String(id),
                      submitterId: currentUser?.userId,
                      refreshData: handleFetchSocialHistory,
                      refreshPrivacyLevel: refreshPatientPrivacyLevel
                    })
                  }
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                  </span>
                </Button>
              )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">

          {/* First Half */}
          <div className="space-y-2">
            {socialHistoryColumns
              .slice(0, Math.ceil(socialHistoryColumns.length / 2))
              .map((column) => (
                <div key={column.key} className="space-y-1">
                  {column.key === "accessLevelSensitive" ? (
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">{column.header}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-lg underline">Privacy Levels:</p>
                              <p><strong>Low:</strong> All social history information is accessible to all staff members</p>
                              <p><strong>Medium:</strong> Selected social history information is accessible to Doctors</p>
                              <p><strong>High:</strong> ??</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{column.header}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {column.key === "accessLevelSensitive"
                      ? (column.customValue !== null ? convertPrivacyLevel(column.customValue) : "MEDIUM")
                      : (socialHistory?.[column.key] ?? "-")
                    }
                  </p>
                </div>
              ))}
          </div>
          {/* Second Half */}
          <div className="space-y-2">
            {socialHistoryColumns
              .slice(Math.ceil(socialHistoryColumns.length / 2))
              .map((column) => (
                <div key={column.key} className="space-y-1">
                  <p className="text-sm font-medium">{column.header}</p>
                  <p className="text-sm text-muted-foreground">
                    {column.key === "accessLevelSensitive"
                      ? (column.customValue !== null ? convertPrivacyLevel(column.customValue) : "-")
                      : (socialHistory?.[column.key] ?? "-")
                    }
                  </p>
                </div>
              ))}
          </div>
          <div className="col-span-full mt-4 pt-3 border-t border-border flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-muted font-bold">NOT AVAILABLE</span>
              <span>Patient did not provide this information</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-muted font-bold">NOT SHOWN</span>
              <span>Information restricted due to privacy settings</span>
            </div>
          </div>
        </CardContent>

      </Card>
    </>
  );
};

export default SocialHistoryCard;
