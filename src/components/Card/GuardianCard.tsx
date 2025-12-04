import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useModal } from "@/hooks/useModal";
import { DataTableClient, TableRowData } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchGuardianByPatientId, IGuardian } from "@/api/patients/guardian";

interface GuardianRow extends TableRowData {
  guardianName: string;
  preferredName?: string;
  nric: string;
  relationshipWithPatient: string;
  contactNo: string;
  address: string;
  email: string;
}

const GuardianCard: React.FC = () => {
  const { id } = useViewPatient();
  const { openModal } = useModal();
  const [rows, setRows] = useState<GuardianRow[]>([]);
  const { currentUser } = useAuth();
  useEffect(() => {
    const load = async () => {
      if (!id || isNaN(Number(id))) return;
      try {
        const data: IGuardian[] = await fetchGuardianByPatientId(Number(id));

        const mapped: GuardianRow[] = data.map(
          ({ patient_guardian, relationshipName }, idx) => ({
            id: patient_guardian.id ?? `${id}-${idx}`,
            guardianName: [
              patient_guardian.firstName,
              patient_guardian.lastName,
            ]
              .filter(Boolean)
              .join(" "),
            preferredName: patient_guardian.preferredName ?? "",
            nric: patient_guardian.nric,
            relationshipWithPatient: relationshipName,
            contactNo: patient_guardian.contactNo,
            address: patient_guardian.address,
            email: patient_guardian.email,
          })
        );

        setRows(mapped);
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch guardian for patient");
      }
    };

    load();
  }, [id]);

  const guardianColumns = [
    { key: "guardianName", header: "Guardian Name" },
    { key: "preferredName", header: "Preferred Name" },
    { key: "nric", header: "NRIC" },
    { key: "relationshipWithPatient", header: "Patient's" },
    { key: "contactNo", header: "Contact Number" },
    { key: "address", header: "Address" },
    { key: "email", header: "Email" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Guardian</span>
          {
            (currentUser?.roleName !== "GUARDIAN") && (
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
            )
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTableClient
          data={rows}
          columns={guardianColumns}
          viewMore={false}
        />
      </CardContent>
    </Card>
  );
};

export default GuardianCard;