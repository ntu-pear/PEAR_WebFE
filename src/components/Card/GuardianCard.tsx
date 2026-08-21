import { useEffect, useState } from "react";
import { PlusCircle, UserPlus, Pencil, UserMinus } from "lucide-react";
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
  raw: IGuardian;
}

const GuardianCard: React.FC = () => {
  const { id } = useViewPatient();
  const { openModal } = useModal();
  const [rows, setRows] = useState<GuardianRow[]>([]);
  const { currentUser } = useAuth();

  const refreshGuardianData = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const data: IGuardian[] = await fetchGuardianByPatientId(Number(id));

      const mapped: GuardianRow[] = data.map(
        (guardian, idx) => ({
          id: guardian.patient_guardian.id ?? `${id}-${idx}`,
          guardianName: [
            guardian.patient_guardian.firstName,
            guardian.patient_guardian.lastName,
          ]
            .filter(Boolean)
            .join(" "),
          preferredName: guardian.patient_guardian.preferredName ?? "",
          nric: guardian.patient_guardian.nric,
          relationshipWithPatient: guardian.relationshipName,
          contactNo: guardian.patient_guardian.contactNo,
          address: guardian.patient_guardian.address,
          email: guardian.patient_guardian.email,
          raw: guardian,
        })
      );

      setRows(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch guardian for patient");
    }
  };

  useEffect(() => {
    refreshGuardianData();
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  variant="outline"
                  onClick={() =>
                    openModal("addExistingGuardian", {
                      patientId: Number(id),
                      refreshGuardianData,
                    })
                  }
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Existing
                  </span>
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() =>
                    openModal("addGuardian", {
                      patientId: Number(id),
                      refreshGuardianData,
                    })
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add New
                  </span>
                </Button>
              </div>
            )
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTableClient
          data={rows}
          columns={guardianColumns}
          viewMore={false}
          renderActions={
            currentUser?.roleName !== "GUARDIAN"
              ? (item) => (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        openModal("editGuardian", {
                          guardian: item.raw,
                          patientId: Number(id),
                          refreshGuardianData,
                        })
                      }
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        openModal("deleteGuardian", {
                          patientId: Number(id),
                          guardianId: item.raw.patient_guardian.id,
                          refreshGuardianData,
                        })
                      }
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Unassign
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
};

export default GuardianCard;
