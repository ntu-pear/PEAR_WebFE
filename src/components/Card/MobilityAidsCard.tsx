import {
  fetchMobilityAids,
  MobilityAidTD,
  MobilityAidTDServer,
} from "@/api/patients/mobility";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";

const MobilityAidsCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { id, patientAllocation } = useViewPatient();
  const { openModal } = useModal();
  const [mobilityAidsTDServer, setMobilityAidsTDServer] =
    useState<MobilityAidTDServer>({
      mobilityAids: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    });

  const handleFetchMobilityAids = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedData: MobilityAidTDServer = await fetchMobilityAids(
        Number(id),
        pageNo
      );

      setMobilityAidsTDServer(fetchedData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient mobility aids");
    }
  };

  useEffect(() => {
    refreshMobilityData();
  }, []);

  const refreshMobilityData = () => {
    handleFetchMobilityAids(mobilityAidsTDServer.pagination.pageNo || 0);
  };

  const mobilityAidsColumns = [
    { key: "mobilityAids", header: "Mobility Aids" },
    { key: "remark", header: "Remark" },
    { key: "condition", header: "Condition" },
    { key: "recoveryDate", header: "Recovery Date"},
    { key: "date", header: "Created Date" },
  ];

  const renderActions = (item: MobilityAidTD) => {
    return (
      (currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
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
            {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
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
          <DataTableServer
            data={mobilityAidsTDServer.mobilityAids}
            pagination={mobilityAidsTDServer.pagination}
            columns={mobilityAidsColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
            fetchData={handleFetchMobilityAids}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default MobilityAidsCard;
