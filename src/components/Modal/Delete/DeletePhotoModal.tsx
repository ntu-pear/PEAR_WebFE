import { useModal } from "@/hooks/useModal"
import BaseDeleteModal from "./BaseDeleteModal"
import { deletePatientPersonalPhoto } from "@/api/patients/photoAlbum"
import React, { useState } from "react"
import { toast } from "sonner"

const DeletePhotoModal = () => {
    const { modalRef, closeModal, activeModal } = useModal()
    const { photoId, refreshData } = activeModal.props as {
        photoId: number,
        refreshData: () => void
    }
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            await deletePatientPersonalPhoto(photoId)
            await refreshData()
            toast.success("Deleted successfully.")
            closeModal()
        } catch (error) {
            setIsLoading(false)
            toast.error("Failed to delete.")
        }
    }
    return (
        <>
            {
                isLoading ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div ref={modalRef} className="bg-white p-8 rounded-md w-[400px]">
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <p>Deleting Photo...</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <BaseDeleteModal
                        modalRef={modalRef}
                        closeModal={closeModal}
                        onSubmit={handleSubmit}
                    />
                )
            }
            {/* <BaseDeleteModal
                modalRef={modalRef}
                closeModal={closeModal}
                onSubmit={handleSubmit}
            /> */}

        </>
    )
}
export default DeletePhotoModal