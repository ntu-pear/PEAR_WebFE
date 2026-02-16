import { useModal } from "@/hooks/useModal"
import BaseDeleteModal from "./BaseDeleteModal"
import { deletePatientPersonalPhoto } from "@/api/patients/photoAlbum"
import React from "react"
import { toast } from "sonner"

const DeletePhotoModal = () => {
    const { modalRef, closeModal, activeModal } = useModal()
    const { photoId, refreshData } = activeModal.props as {
        photoId: number,
        refreshData: () => void
    }
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        try {
            await deletePatientPersonalPhoto(photoId)
            toast.success("Patient Personal Photo deleted successfully.")
            await refreshData()
            closeModal()
        } catch (error) {
            closeModal();
            toast.error("Failed to delete patient personal photo.");
        }
    }
    return (
        <>
            <BaseDeleteModal
                modalRef={modalRef}
                closeModal={closeModal}
                onSubmit={handleSubmit}
            />
        </>
    )
}
export default DeletePhotoModal