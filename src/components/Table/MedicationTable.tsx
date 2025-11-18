import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableServer } from "@/components/Table/DataTable";
import { PatientTableData } from "@/api/patients/patients";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  fetchPatientMedicationTD,
  IMedicationTableDataServer,
} from "@/api/patients/medication";

type TMedicationTableProps = {
  patient: PatientTableData;
  openModal: (
    modalName: string,
    modalProps?: Record<string, unknown> | undefined
  ) => void;
};

const MedicationTable = ({ patient, openModal }: TMedicationTableProps) => {
  const [medication, setMedication] = useState<IMedicationTableDataServer>({
    medications: [],
    pagination: { pageNo: 0, pageSize: 0, totalRecords: 0, totalPages: 0 },
  });
  const { currentUser } = useAuth();

  const medicationColumns = [
    { key: "drugName", header: "Drug Name" },
    { key: "administerTime", header: "Administer Time" },
    { key: "dosage", header: "Dosage" },
    {
      key: "instruction",
      header: "Instruction",
      className: "whitespace-normal break-words",
    },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    {
      key: "prescriptionRemarks",
      header: "Remarks",
      className: "whitespace-normal break-words",
    },
  ];

  const handleFetchMedication = async (pageNo: number) => {
    if (!patient.id) return;

    try {
      const patientMedications = await fetchPatientMedicationTD(
        Number(patient.id),
        pageNo
      );
      setMedication(patientMedications);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch medication for patient");
    }
  };

  const refreshPatientMedication = () =>
    handleFetchMedication(medication.pagination.pageNo || 0);

  useEffect(() => {
    handleFetchMedication(0);
  }, []);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Medication Details for {patient.preferredName}
        </h3>
        <Button
          size="sm"
          className="h-8 gap-1"
          onClick={() =>
            openModal("addMedication", {
              patientId: patient.id,
              submitterId: currentUser?.userId,
              refreshMedicationData: refreshPatientMedication,
            })
          }
        >
          <PlusCircle className="h-4 w-4" />
          <span className="whitespace-nowrap">Add Medication</span>
        </Button>
      </div>
      <DataTableServer
        data={medication.medications}
        pagination={medication.pagination}
        fetchData={handleFetchMedication}
        columns={medicationColumns}
        viewMore={false}
        hideActionsHeader={false}
        renderActions={(item) => (
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                openModal("editMedication", {
                  medicationId: String(item.id),
                  submitterId: currentUser?.userId,
                  refreshMedicationData: refreshPatientMedication,
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                openModal("deleteMedication", {
                  medicationId: String(item.id),
                  refreshMedicationData: refreshPatientMedication,
                });
              }}
            >
              Delete
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default MedicationTable;
