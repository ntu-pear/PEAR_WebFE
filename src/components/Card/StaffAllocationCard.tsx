import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FilePenLine } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { retrieveStaffNRICName } from "@/api/patients/staffAllocation"
import { useEffect, useState } from "react";
import type { DataTableColumns } from "../Table/DataTable";

const StaffAllocationCard: React.FC = () => {
  type staffRow = {
    id: string;
    staffRole: string;
    staffName: string;
  }
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [staffTableData, setStaffTableData] = useState<staffRow[]>([])
  const { id, patientAllocation, refreshPatientData } = useViewPatient();

  const staffAllocationColumns: DataTableColumns<staffRow> = [
    { key: "staffRole", header: "Staff Role" },
    { key: "staffName", header: "Staff Name" },
  ];

  useEffect(() => {
    const fetchStaffNames = async () => {
      if (!patientAllocation) return
      try {
        const rows: staffRow[] = []

        if (patientAllocation.doctorId) {
          const doctor = await retrieveStaffNRICName(patientAllocation.doctorId)
          rows.push({
            id: patientAllocation.doctorId,
            staffRole: "DOCTOR",
            staffName: doctor.nric_FullName
          })
        }
        else {
          rows.push({
            id: "doctor-empty",
            staffRole: "DOCTOR",
            staffName: "NOT ASSIGNED"
          })
        }

        if (patientAllocation.gameTherapistId) {
          const gameTherapist = await retrieveStaffNRICName(patientAllocation.gameTherapistId)
          rows.push({
            id: patientAllocation.gameTherapistId,
            staffRole: "GAME THERAPIST",
            staffName: gameTherapist.nric_FullName
          })
        }
        else {
          rows.push({
            id: "gametherapist-empty",
            staffRole: "GAME THERAPIST",
            staffName: "NOT ASSIGNED"
          })
        }

        if (patientAllocation.supervisorId) {
          const supervisor = await retrieveStaffNRICName(patientAllocation.supervisorId)
          rows.push({
            id: patientAllocation.supervisorId,
            staffRole: "SUPERVISOR",
            staffName: supervisor.nric_FullName
          })
        }
        else {
          rows.push({
            id: "supervisor-empty",
            staffRole: "SUPERVISOR",
            staffName: "NOT ASSIGNED"
          })
        }

        if (patientAllocation.caregiverId) {
          const caregiver = await retrieveStaffNRICName(patientAllocation.caregiverId)
          rows.push({
            id: patientAllocation.caregiverId,
            staffRole: "CAREGIVER",
            staffName: caregiver.nric_FullName
          })
        }
        else {
          rows.push({
            id: "caregiver-empty",
            staffRole: "CAREGIVER",
            staffName: "NOT ASSIGNED"
          })
        }

        setStaffTableData(rows)

      } catch (error) {
        console.error("Error fetching staff names:", error)
        const err = error as any;
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Session expired. Please log in again.");
        } else {
          toast.error("Failed to fetch patient information");
        }
      }
    }
    fetchStaffNames()
  }, [patientAllocation])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Staff Allocation</span>
            {currentUser?.roleName === "SUPERVISOR" && (
              (patientAllocation?.caregiverId &&
                patientAllocation?.doctorId &&
                patientAllocation?.gameTherapistId &&
                patientAllocation?.supervisorId
              ) ? (
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() => openModal("editStaffAllocation", {
                    patientId: Number(id),
                    guardianId: patientAllocation?.guardianId,
                    allocationId: patientAllocation?.id,
                    doctorId: patientAllocation?.doctorId,
                    gametherapistId: patientAllocation?.gameTherapistId,
                    supervisorId: patientAllocation?.supervisorId,
                    caregiverId: patientAllocation?.caregiverId,
                    onSuccess: refreshPatientData
                  })}
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                  </span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() => openModal("addStaffAllocation", {
                    patientId: Number(id),
                    guardianId: patientAllocation?.guardianId,
                    allocationId: patientAllocation?.id,
                    onSuccess: refreshPatientData
                  })}
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add
                  </span>
                </Button>
              )
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={staffTableData}
            columns={staffAllocationColumns}
            viewMore={false}
            hideActionsHeader={true}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default StaffAllocationCard;
