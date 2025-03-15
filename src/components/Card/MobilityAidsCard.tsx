import { fetchMobilityAids } from "@/api/patients/mobility";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { MobilityAidTD, mockMobilityAidsTD } from "@/mocks/mockPatientDetails";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";

const MobilityAidsCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { id } = useViewPatient();
  const { openModal } = useModal();
  const [mobilityAids, setMobilityAids] = useState<MobilityAidTD[]>([]);

  const handleFetchMobilityAids = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedMobilityAids: MobilityAidTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchMobilityAids(Number(id))
          : mockMobilityAidsTD;

      setMobilityAids(fetchedMobilityAids);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient mobility aids");
    }
  };

  useEffect(() => {
    handleFetchMobilityAids();
  }, []);

  const refreshMobilityData = () => {
    handleFetchMobilityAids();
  };

  const mobilityAidsColumns = [
    { key: "mobilityAids", header: "Mobility Aids" },
    { key: "remark", header: "Remark" },
    { key: "condition", header: "Condition" },
    { key: "date", header: "Date" },
  ];

  const renderActions = (item: MobilityAidTD) => {
    return (
      currentUser?.roleName === "SUPERVISOR" && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("editMobilityAids", {
                mobilityAidId: String(item.id),
                refreshData: handleFetchMobilityAids,
              })
            }
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("deleteMobilityAids", {
                mobilityAidId: String(item.id),
                refreshData: handleFetchMobilityAids,
              })
            }
          >
            Delete
          </Button>
        </div>
      )
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Mobility Aids</span>
            {currentUser?.roleName === "SUPERVISOR" && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addMobilityAids", {
                    patientId: String(id),
                    submitterId: currentUser?.userId,
                    refreshMobilityData,
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={mobilityAids}
            columns={mobilityAidsColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default MobilityAidsCard;
