import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useModal } from "@/hooks/useModal";
import { GuardianTD, mockGuardian } from "@/mocks/mockPatientDetails";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DataTableClient } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";

const GuardianCard: React.FC = () => {
  const { id } = useViewPatient();
  const [guardian, setGuardian] = useState<GuardianTD[]>([]);
  const { openModal } = useModal();

  const handleFetchGuardianTD = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedGuardianTD: GuardianTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? mockGuardian
          : mockGuardian;

      setGuardian(fetchedGuardianTD);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch guardian for patient");
    }
  };

  useEffect(() => {
    console.log("patientId", id);
    handleFetchGuardianTD();
  }, []);

  const guardianColumns = [
    { key: "guardianType", header: "Guardian Type" },
    { key: "guardianName", header: "Guardian Name" },
    { key: "preferredName", header: "Preferred Name" },
    { key: "nric", header: "NRIC" },
    { key: "relationshipWithPatient", header: "Patient's" },
    { key: "contractNo", header: "Contact Number" },
    { key: "address", header: "Address" },
    { key: "email", header: "Email" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Guardian</span>
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("addGuardian")}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add
              </span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={guardian}
            columns={guardianColumns}
            viewMore={false}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default GuardianCard;
