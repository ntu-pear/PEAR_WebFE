import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Staff, Doctor, Caregiver, Supervisor, GameTherapist, fetchAllStaff, updateStaffAllocation } from "@/api/patients/staffAllocation"
import { toast } from "sonner";

interface EditStaffAllocationModalProps {
  allocationId: number,
  patientId: number,
  doctorId?: string;
  gametherapistId?: string;
  supervisorId?: string;
  caregiverId?: string;
  guardianId: number
  onSuccess?: () => void
}

const EditStaffAllocationModal: React.FC<EditStaffAllocationModalProps> = () => {
  const { currentUser } = useAuth();
  const { modalRef, closeModal, activeModal } = useModal();
  const {
    allocationId,
    patientId,
    doctorId,
    gametherapistId,
    supervisorId,
    caregiverId,
    guardianId,
    onSuccess
  } = activeModal.props as unknown as EditStaffAllocationModalProps;
  const [doctorList, setDoctorList] = useState<Doctor[]>([])
  const [caregiverList, setCaregiverList] = useState<Caregiver[]>([])
  const [supervisorList, setSupervisorList] = useState<Supervisor[]>([])
  const [gametherapistList, setGameTherapistList] = useState<GameTherapist[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState(doctorId || "")
  const [selectedGameTherapist, setSelectedGameTherapist] = useState(gametherapistId || "")
  const [selectedSupervisor, setSelectedSupervisor] = useState(supervisorId || "")
  const [selectedCaregiver, setSelectedCaregiver] = useState(caregiverId || "")

  const handleEditStaffAllocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!allocationId || !patientId || !guardianId || !currentUser?.userId) {
      closeModal()
      return
    }
    try {
      const response = await updateStaffAllocation(
        {
          patientId,
          allocationId,
          doctorId: selectedDoctor,
          gameTherapistId: selectedGameTherapist,
          supervisorId: selectedSupervisor,
          caregiverId: selectedCaregiver,
          guardianId,
          ModifiedById: currentUser?.userId
        }
      )
      console.log(response)
      onSuccess?.();
      toast.success("Patient staff allocation updated successfully.")
      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update staff allocation. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          "Failed to update staff allocation. An unknown error occurred."
        );
      }
      console.log("Failed to update staff allocation",error)
      closeModal();
    }
  };

  useEffect(() => {
    const getAllStaff = async () => {
      try {
        const response = await fetchAllStaff()
        const allStaff = response.users || []
        setDoctorList(allStaff.filter((staff: Staff) => staff.role === "DOCTOR"))
        setCaregiverList(allStaff.filter((staff: Staff) => staff.role === "CAREGIVER"))
        setSupervisorList(allStaff.filter((staff: Staff) => staff.role === "SUPERVISOR"))
        setGameTherapistList(allStaff.filter((staff: Staff) => staff.role === "GAME THERAPIST"))
      } catch (error) {
        console.error("Failed to fetch all staff,", error)
      }
    }
    getAllStaff()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Edit Staff Allocation</h3>
        <form
          onSubmit={handleEditStaffAllocation}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Doctor<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">SELECT A DOCTOR</option>
              {
                doctorList.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.nric_FullName}</option>
                ))
              }
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Game Therapist<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
              value={selectedGameTherapist}
              onChange={(e) => setSelectedGameTherapist(e.target.value)}
            >
              <option value="">SELECT A GAME THERAPIST</option>
              {
                gametherapistList.map((gametherapist) => (
                  <option key={gametherapist.id} value={gametherapist.id}>{gametherapist.nric_FullName}</option>
                ))
              }
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Supervisor<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
            >
              <option value="">SELECT A SUPERVISOR</option>
              {
                supervisorList.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>{supervisor.nric_FullName}</option>
                ))
              }
            </select>
          </div>

          <div className="col-span-2">
            <div>
              <label className="block text-sm font-medium">
                Caregiver<span className="text-red-600">*</span>
              </label>
              <select
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
                value={selectedCaregiver}
                onChange={(e) => setSelectedCaregiver(e.target.value)}
              >
                <option value="">SELECT A CAREGIVER</option>
                {
                  caregiverList.map((caregiver) => (
                    <option key={caregiver.id} value={caregiver.id}>{caregiver.nric_FullName}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffAllocationModal;
