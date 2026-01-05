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
import { FilePenLine, PlusCircle } from "lucide-react";

const SocialHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [socialHistory, setSocialHistory] = useState<SocialHistoryTD | null>(
    null
  );

  const handleFetchSocialHistory = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedSocialHistory: SocialHistoryTD = await fetchSocialHistoryTD(
        Number(id)
      );
      setSocialHistory(fetchedSocialHistory);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch patient social history");
      }
    }
  };

  useEffect(() => {
    handleFetchSocialHistory();
  }, []);

  const socialHistoryColumns = [
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
              ? (currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
                  <Button
                    size="sm"
                    className="h-8 w-24 gap-1"
                    onClick={() =>
                      openModal("addSocialHistory", {
                        patientId: String(id),
                        submitterId: currentUser?.userId,
                        refreshData: handleFetchSocialHistory,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add
                    </span>
                  </Button>
                )
              : currentUser?.roleName === "SUPERVISOR" && (
                  <Button
                    size="sm"
                    className="h-8 w-24 gap-1"
                    onClick={() =>
                      openModal("editSocialHistory", {
                        patientId: String(id),
                        submitterId: currentUser?.userId,
                        refreshData: handleFetchSocialHistory,
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
                  <p className="text-sm font-medium">{column.header}</p>
                  <p className="text-sm text-muted-foreground">
                    {socialHistory?.[column.key as keyof SocialHistoryTD] ||
                      "-"}
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
                    {socialHistory?.[column.key as keyof SocialHistoryTD] ||
                      "-"}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SocialHistoryCard;
