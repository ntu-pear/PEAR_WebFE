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
            toast.success("Patient Routine delete Successfully.")
            refreshRoutineData()
            closeModal()
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to delete Patient Routine.${error}`)
            }
            else {
                toast.error(`Failed to delete Patient Routine.`)
            }
            console.log("Failed to delete Patient Routine.", error)
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