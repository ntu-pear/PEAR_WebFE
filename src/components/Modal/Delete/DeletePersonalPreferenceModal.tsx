import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal";
import { toast } from "sonner";
import { RemovePersonalPreference } from "@/api/patients/personalPreference";


const DeletePersonalPreference: React.FC = () => {
    const { modalRef, activeModal, closeModal } = useModal();
    const { personalPreferenceId, refreshData } = activeModal.props as {
        personalPreferenceId: number,
        refreshData: () => void
    }

    const handleDeletePersonalPreference = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!personalPreferenceId) return;
        try {
            await RemovePersonalPreference(personalPreferenceId);
            refreshData();
            closeModal();
            toast.success("Patient Personal Preference deleted successfully.");
        } catch (error) {
            closeModal();
            toast.error("Failed to delete patient Personal Preference.");
            console.error("Failed to delete patient Personal Preference.")
        }
    };

    return (
        <>
            <BaseDeleteModal
                modalRef={modalRef}
                onSubmit={handleDeletePersonalPreference}
                closeModal={closeModal}
            />
        </>
    );
}

export default DeletePersonalPreference