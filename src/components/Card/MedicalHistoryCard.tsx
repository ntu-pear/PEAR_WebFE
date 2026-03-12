import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useMemo, useState } from "react";
import { fetchMedicalHistory, MedicalHistoryTD } from "@/api/patients/medicalHistory";
import { toast } from "sonner";

const MedicalHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [medicalHistoryList, setMedicalHistoryList] = useState<MedicalHistoryTD[]>([])
  const [pageNo, setPageNo] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const medicalDetailsColumns = [
    { key: "diagnosis_name", header: "Diagnosis Name" },
    { key: "source_of_information", header: "Source of Information" },
    { key: "remarks", header: "Remarks" },
    { key: "date_of_diagnosis", header: "Date of Diagnosis" },
  ];

  const fetchPatientMedicalHistory = async () => {
    try {
      const history = await fetchMedicalHistory(Number(id))
      setMedicalHistoryList(history)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to fetch patient medical history. ${error}`);
      } else {
        toast.error("Failed to fetch patient medical history")
      }
      console.error("Failed to fetch patient medical history")
    }
  }

  useEffect(() => {
    fetchPatientMedicalHistory()
  }, [id])

  const paginatedHistory = useMemo(() => {
    const start = pageNo * pageSize
    return medicalHistoryList.slice(start, start + pageSize)
  }, [medicalHistoryList, pageNo, pageSize])

  const pagination = useMemo(() => ({
    pageNo,
    pageSize,
    totalRecords: medicalHistoryList.length,
    totalPages: Math.ceil(medicalHistoryList.length / pageSize)
  }), [medicalHistoryList, pageNo, pageSize])

  const handleFetchData = (newPageNo: number, newPageSize: number) => {
    setPageNo(newPageNo)
    setPageSize(newPageSize)
  }

  const renderActions = (medicalHistory: MedicalHistoryTD) => {
    return (
      (currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("editMedicalHistory", {
                medicalHistory: medicalHistory,
                refreshData: () => { fetchPatientMedicalHistory() },
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
              openModal("deleteMedicalHistory", {
                medicalHistoryId: Number(medicalHistory.id),
                refreshData: () => {
                  const isLastItemOnPage = paginatedHistory.length === 1 && pageNo > 0
                  if (isLastItemOnPage) setPageNo(p => p - 1)
                  fetchPatientMedicalHistory()
                }
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
            <span>Medical History</span>
            {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addMedicalHistory", {
                  patientId: id,
                  submitterId: currentUser?.userId,
                  refreshData: () => { fetchPatientMedicalHistory() },
                })}
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
            data={paginatedHistory}
            pagination={pagination}
            columns={medicalDetailsColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={handleFetchData}
            renderActions={renderActions}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default MedicalHistoryCard;
