import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { mockMedicalDetails } from "@/mocks/mockPatientDetails";
import { useAuth } from "@/hooks/useAuth";

const MedicalHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();

  const medicalDetailsColumns = [
    { key: "medicalDetails", header: "Medical Details" },
    { key: "informationSource", header: "Information Source" },
    { key: "medicalEstimatedDate", header: "Medical Estimated Date" },
    { key: "notes", header: "Notes" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Medical History</span>
            {currentUser?.roleName === "SUPERVISOR" && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addMedicalHistory")}
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
            data={mockMedicalDetails}
            columns={medicalDetailsColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default MedicalHistoryCard;
