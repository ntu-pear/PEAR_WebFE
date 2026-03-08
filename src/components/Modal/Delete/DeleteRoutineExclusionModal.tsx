import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal"
import { toast } from "sonner";
import { deleteRoutineExclusion } from "@/api/activity/routine";

const DeleteRoutineExclusionModal = () => {
    const { modalRef, activeModal, closeModal } = useModal();
    const { exclusionId, refreshRoutineExclusion } = activeModal.props as {
        exclusionId: number,
        refreshRoutineExclusion: () => void
    }

    const handleDeleteRoutineExclusion = async () => {
        console.log("Starting delete for exclusion:", exclusionId);
        try {
            await deleteRoutineExclusion(exclusionId)
            closeModal()            
            await refreshRoutineExclusion()
            toast.success("Routine Exclusion deleted Successfully.")
        } catch (error) {
            console.error("Delete failed:", error);
            if (error instanceof Error) {
                toast.error(`Failed to delete Routine Exclusion.${error.message}`)
            }
            else {
                toast.error(`Failed to delete Routine Exclusion.`)
            }
            console.log("Failed to delete Routine Exclusion.", error)
            await refreshRoutineExclusion()
            closeModal()
        }
    }

    return (
        <>
            <BaseDeleteModal
                modalRef={modalRef}
                onSubmit={handleDeleteRoutineExclusion}
                closeModal={closeModal}
            />
        </>
    )
}

export default DeleteRoutineExclusionModal