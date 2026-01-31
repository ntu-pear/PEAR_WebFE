import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal";
import { toast } from "sonner";
import { deletePatientRoutine } from "@/api/activity/routine";

const DeleteRoutineModal = () => {
    const { modalRef, activeModal, closeModal } = useModal();
    const { routineId, refreshRoutineData } = activeModal.props as {
        routineId: string;
        refreshRoutineData: () => void;
    };

    const handleDeleteRoutine = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!routineId || isNaN(Number(routineId))) {
            return;
        }
        try {
            await deletePatientRoutine(Number(routineId))
            await refreshRoutineData()
            toast.success("Patient Routine deleted Successfully.")
            closeModal()
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to delete Patient Routine.${error.message}`)
            }
            else {
                toast.error(`Failed to delete Patient Routine.`)
            }
            console.log("Failed to delete Patient Routine.", error)
            await refreshRoutineData()
            closeModal()
        }
    }
    return (
        <>
            <BaseDeleteModal
                modalRef={modalRef}
                onSubmit={handleDeleteRoutine}
                closeModal={closeModal}
            />
        </>
    )
}

export default DeleteRoutineModal