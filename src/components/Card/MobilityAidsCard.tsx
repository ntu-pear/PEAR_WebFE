import {
  fetchMobilityAids,
  MobilityAidTD,
} from "@/api/patients/mobility";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";

const MobilityAidsCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { id, patientAllocation } = useViewPatient();
  const { openModal } = useModal();
  const [mobilityAidsTDServer, setMobilityAidsTDServer] = useState<MobilityAidTD[]>([]);
  const [pageNo, setPageNo] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const handleFetchMobilityAids = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedData: MobilityAidTD[] = await fetchMobilityAids(
        Number(id)
      );
      setMobilityAidsTDServer(fetchedData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient mobility aids");
    }
  };

  useEffect(() => {
    handleFetchMobilityAids();
  }, [id]);

  const pagedMobilityAids = useMemo(() => {
    const start = pageNo * pageSize
    return mobilityAidsTDServer.slice(start, start + pageSize)
  }, [mobilityAidsTDServer, pageNo, pageSize])

  const pagination = useMemo(() => ({
    pageNo,
    pageSize,
    totalRecords: mobilityAidsTDServer.length,
    totalPages: Math.ceil(mobilityAidsTDServer.length / pageSize)
  }), [mobilityAidsTDServer, pageSize, pageNo])

  const handleFetchData = (newPageNo: number, newPageSize: number) => {
    setPageNo(newPageNo)
    setPageSize(newPageSize)
  }

  const mobilityAidsColumns = [
    { key: "mobilityAids", header: "Mobility Aids" },
    { key: "remark", header: "Remark" },
    { key: "condition", header: "Condition" },
    { key: "recoveryDate", header: "Recovery Date" },
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
                refreshData: () => { handleFetchMobilityAids() },
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
                refreshData: () => {
                  const isLastItemOnPage = pagedMobilityAids.length === 1 && pageNo > 0
                  if (isLastItemOnPage) setPageNo(p => p - 1)
                  handleFetchMobilityAids()
                }
              },
              )
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
                    refreshMobilityData: () => {handleFetchMobilityAids()},
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
            data={pagedMobilityAids}
            pagination={pagination}
            columns={mobilityAidsColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={handleFetchData}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default MobilityAidsCard;
