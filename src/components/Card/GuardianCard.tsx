import { useEffect, useState } from "react";
import { PlusCircle, UserPlus, Pencil, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useModal } from "@/hooks/useModal";
import { DataTableClient, TableRowData } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { fetchGuardianByPatientId, IGuardian } from "@/api/patients/guardian";

const MAX_GUARDIANS_PER_PATIENT = 2;
const GUARDIAN_LIMIT_MESSAGE = `This patient already has ${MAX_GUARDIANS_PER_PATIENT} guardians. Unassign one before adding another.`;

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
  const { id, patientAllocation, refreshPatientData } = useViewPatient();
  const { openModal } = useModal();
  const [rows, setRows] = useState<GuardianRow[]>([]);
  const { currentUser } = useAuth();
  const atGuardianLimit = rows.length >= MAX_GUARDIANS_PER_PATIENT;

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
    {
      key: "guardianRole",
      header: "Role",
      render: (_value: unknown, item: GuardianRow) => {
        if (!patientAllocation) return null;
        return patientAllocation.guardianId === item.raw.patient_guardian.id ? (
          <Badge>Primary</Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800"
          >
            Secondary
          </Badge>
        );
      },
    },
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
              <TooltipProvider>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={atGuardianLimit ? 0 : -1}>
                        <Button
                          size="sm"
                          className="h-8 gap-1"
                          variant="outline"
                          disabled={atGuardianLimit}
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
                      </span>
                    </TooltipTrigger>
                    {atGuardianLimit && (
                      <TooltipContent>{GUARDIAN_LIMIT_MESSAGE}</TooltipContent>
                    )}
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={atGuardianLimit ? 0 : -1}>
                        <Button
                          size="sm"
                          className="h-8 gap-1"
                          disabled={atGuardianLimit}
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
                      </span>
                    </TooltipTrigger>
                    {atGuardianLimit && (
                      <TooltipContent>{GUARDIAN_LIMIT_MESSAGE}</TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </TooltipProvider>
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
                          isPrimary:
                            patientAllocation?.guardianId ===
                            item.raw.patient_guardian.id,
                          allocationId: patientAllocation?.id,
                          refreshPatientData,
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
                        openModal("unassignGuardian", {
                          patientId: Number(id),
                          guardianId: item.raw.patient_guardian.id,
                          refreshGuardianData,
                          allocationId: patientAllocation?.id,
                          primaryGuardianId: patientAllocation?.guardianId,
                          refreshPatientData,
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
