import { useModal } from "@/hooks/useModal";
import { mockProblemLog } from "@/mocks/mockPatientDetails";
import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

//Renamed to Problem History from Problem Log to avoid confusion with logs from logging service
const ProblemHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { patientAllocation } = useViewPatient()
  const problemLogColumns = [
    { key: "author", header: "Author" },
    { key: "description", header: "Description" },
    { key: "remark", header: "Remark" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Problem History</span>
            {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId)&& (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addProblem")}
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
            data={mockProblemLog}
            columns={problemLogColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ProblemHistoryCard;
