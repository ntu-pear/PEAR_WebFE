import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Staff, Doctor, Caregiver, Supervisor, GameTherapist, fetchAllStaff, updateStaffAllocation } from "@/api/patients/staffAllocation"
import { toast } from "sonner";

interface AddStaffAllocationModalProps {
    allocationId: number,
    patientId: number,
    guardianId: number,
    onSuccess?: () => void
}
// { allocationId,
//     patientId,
//     guardianId }

const AddStaffAllocationModal: React.FC<AddStaffAllocationModalProps> = () => {
    const { currentUser } = useAuth();
    const { modalRef, closeModal, activeModal } = useModal();
    const {
        allocationId,
        patientId,
        guardianId,
        onSuccess
    } = activeModal.props as unknown as AddStaffAllocationModalProps;
    const [doctorList, setDoctorList] = useState<Doctor[]>([])
    const [caregiverList, setCaregiverList] = useState<Caregiver[]>([])
    const [supervisorList, setSupervisorList] = useState<Supervisor[]>([])
    const [gametherapistList, setGameTherapistList] = useState<GameTherapist[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState("")
    const [selectedGameTherapist, setSelectedGameTherapist] = useState("")
    const [selectedSupervisor, setSelectedSupervisor] = useState("")
    const [selectedCaregiver, setSelectedCaregiver] = useState("")

    const handleAddStaffAllocation = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!allocationId || !patientId || !guardianId || !currentUser?.userId) {
            closeModal()
            return
        }
        const payload = {
            patientId,
            allocationId,
            doctorId: selectedDoctor,
            gameTherapistId: selectedGameTherapist,
            supervisorId: selectedSupervisor,
            caregiverId: selectedCaregiver,
            guardianId,
            ModifiedById: currentUser?.userId
        }
        try {
            const response = await updateStaffAllocation(payload)
            console.log(response)
            console.log("Patient Staff Allocation Added!");
            toast.success("Sucessfully added Patient staff allocation")
            onSuccess?.();
            closeModal();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to add staff allocation. ${error.message}`);
            } else {
                toast.error(
                    "Failed to add staff allocation. An unknown error occurred."
                );
            }
            console.error(error)
            console.log("Failed to add staff allocation")
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
                <h3 className="text-lg font-medium mb-5">Add Staff Allocation</h3>
                <form
                    onSubmit={handleAddStaffAllocation}
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
                        <Button type="submit">Add</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffAllocationModal;