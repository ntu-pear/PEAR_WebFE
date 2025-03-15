import { fetchDiagnosedDementia } from "@/api/patients/diagnosedDementia";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import {
  DiagnosedDementiaTD,
  mockDiagnosedDementiaList,
} from "@/mocks/mockPatientDetails";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableClient } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";

const DiagnosedDementiaCard: React.FC = () => {
  const { id } = useViewPatient();
  const { currentUser } = useAuth();
  const [diagnosedDementia, setDiagnosedDementia] = useState<
    DiagnosedDementiaTD[]
  >([]);

  const handleFetchDiagnosedDementia = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedDiagnosedDementia: DiagnosedDementiaTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchDiagnosedDementia(Number(id))
          : mockDiagnosedDementiaList;
      setDiagnosedDementia(fetchedDiagnosedDementia);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient diagnosed dementia");
    }
  };

  useEffect(() => {
    handleFetchDiagnosedDementia();
  }, []);

  const dementiaColumns = [
    { key: "dementiaType", header: "Dementia Type" },
    { key: "dementiaDate", header: "Dementia Date" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Diagonosed Dementia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={diagnosedDementia}
            columns={dementiaColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "DOCTOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosedDementiaCard;
