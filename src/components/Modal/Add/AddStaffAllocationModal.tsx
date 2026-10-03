import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Staff, Doctor, Caregiver, Supervisor, GameTherapist, fetchAllStaff, updateStaffAllocation } from "@/api/patients/staffAllocation"
import { fetchDoctorPatientTD, fetchCaregiverPatientTD, fetchSupervisorPatientTD } from "@/api/patients/patients"
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

const sortByCount = <T extends { id: string }>(staff: T[], counts: Record<string, number>): T[] => {
    return [...staff].sort((a, b) => {
        const countA = counts[a.id];
        const countB = counts[b.id];
        const rankA = countA === undefined || countA < 0 ? Infinity : countA;
        const rankB = countB === undefined || countB < 0 ? Infinity : countB;
        return rankA - rankB;
    });
};

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
    const [patientCounts, setPatientCounts] = useState<Record<string, number>>({})

    const handleAddStaffAllocation = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!allocationId || !patientId || !guardianId || !currentUser?.userId) {
            closeModal()
            return
        }
        if (!selectedDoctor || !selectedGameTherapist || !selectedSupervisor || !selectedCaregiver) {
            toast.error("Please select a doctor, game therapist, supervisor and caregiver.")
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
                const doctors: Doctor[] = allStaff.filter((staff: Staff) => staff.role === "DOCTOR")
                const caregivers: Caregiver[] = allStaff.filter((staff: Staff) => staff.role === "CAREGIVER")
                const supervisors: Supervisor[] = allStaff.filter((staff: Staff) => staff.role === "SUPERVISOR")
                setDoctorList(doctors)
                setCaregiverList(caregivers)
                setSupervisorList(supervisors)
                setGameTherapistList(allStaff.filter((staff: Staff) => staff.role === "GAME THERAPIST"))

                const counts: Record<string, number> = {}
                await Promise.all([
                    ...doctors.map((doctor) =>
                        fetchDoctorPatientTD(doctor.id, "", null, 0, 1)
                            .then((res) => { counts[doctor.id] = res.pagination.totalRecords })
                            .catch(() => { counts[doctor.id] = -1 })
                    ),
                    ...caregivers.map((caregiver) =>
                        fetchCaregiverPatientTD(caregiver.id, "", null, 0, 1)
                            .then((res) => { counts[caregiver.id] = res.pagination.totalRecords })
                            .catch(() => { counts[caregiver.id] = -1 })
                    ),
                    ...supervisors.map((supervisor) =>
                        fetchSupervisorPatientTD(supervisor.id, "", null, 0, 1)
                            .then((res) => { counts[supervisor.id] = res.pagination.totalRecords })
                            .catch(() => { counts[supervisor.id] = -1 })
                    ),
                ])
                setPatientCounts(counts)
            } catch (error) {
                console.error("Failed to fetch all staff,", error)
            }
        }
        getAllStaff()
    }, [])

    const renderStaffItem = (staffId: string, name: string) => {
        const count = patientCounts[staffId]
        return (
            <div className="flex w-full items-center justify-between gap-3">
                <span>{name}</span>
                {count !== undefined && (
                    count < 0
                        ? <Badge variant="secondary">unavailable</Badge>
                        : <Badge variant="secondary">{count} patient{count === 1 ? "" : "s"}</Badge>
                )}
            </div>
        )
    }

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
                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                            <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortByCount(doctorList, patientCounts).map((doctor) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                        {renderStaffItem(doctor.id, doctor.nric_FullName)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Game Therapist<span className="text-red-600">*</span>
                        </label>
                        <Select value={selectedGameTherapist} onValueChange={setSelectedGameTherapist}>
                            <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select a game therapist" />
                            </SelectTrigger>
                            <SelectContent>
                                {gametherapistList.map((gametherapist) => (
                                    <SelectItem key={gametherapist.id} value={gametherapist.id}>
                                        {gametherapist.nric_FullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Supervisor<span className="text-red-600">*</span>
                        </label>
                        <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                            <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select a supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortByCount(supervisorList, patientCounts).map((supervisor) => (
                                    <SelectItem key={supervisor.id} value={supervisor.id}>
                                        {renderStaffItem(supervisor.id, supervisor.nric_FullName)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Caregiver<span className="text-red-600">*</span>
                        </label>
                        <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                            <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select a caregiver" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortByCount(caregiverList, patientCounts).map((caregiver) => (
                                    <SelectItem key={caregiver.id} value={caregiver.id}>
                                        {renderStaffItem(caregiver.id, caregiver.nric_FullName)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={closeModal}>
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
