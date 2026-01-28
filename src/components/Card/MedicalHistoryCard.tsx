import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { fetchMedicalHistory, MedicalHistoryTD, MedicalHistoryTDServer } from "@/api/patients/medicalHistory";

const   MedicalHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [medicalHistoryList, setMedicalHistoryList] = useState<MedicalHistoryTDServer>({
    medicalHistory: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    }
  })

  const medicalDetailsColumns = [
    { key: "diagnosis_name", header: "Diagnosis Name" },
    { key: "source_of_information", header: "Source of Information" },
    { key: "remarks", header: "Remarks" },
    { key: "date_of_diagnosis", header: "Date of Diagnosis" },
  ];

  const fetchPatientMedicalHistory = async () => {
    const history = await fetchMedicalHistory(Number(id))
    setMedicalHistoryList(history)
  }

  useEffect(() => {
    fetchPatientMedicalHistory()
  }, [])


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
                refreshData: fetchPatientMedicalHistory,
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
                refreshData: fetchPatientMedicalHistory,
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
                  refreshData: fetchPatientMedicalHistory
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
            data={medicalHistoryList.medicalHistory}
            pagination={medicalHistoryList.pagination}
            columns={medicalDetailsColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
            fetchData={fetchPatientMedicalHistory}
            renderActions={renderActions}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default MedicalHistoryCard;
