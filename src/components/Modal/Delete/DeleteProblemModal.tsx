import { useModal } from "@/hooks/useModal"
import BaseDeleteModal from "./BaseDeleteModal"
import { toast } from "sonner"
import { deleteProblemLog } from "@/api/patients/problemLog"

const DeleteProblemModal = () => {
    const {modalRef, closeModal, activeModal} = useModal()
    const {refreshData, problemLogId} = activeModal.props as {
        refreshData:()=>void,
        problemLogId: number
    }

    const handleDeleteProblem = async(event: React.FormEvent)=>{
        event.preventDefault()
        if(!problemLogId)return
        try{  
            await deleteProblemLog(problemLogId)  
            await refreshData()
            closeModal()
        }catch(error){
            if(error instanceof Error){
                toast.error(`Failed to delete patient problem log. ${error}`)
            }else{
                toast.error(`Failed to delete patient problem log.`)
            }
            console.error("Failed to delete patient problem log")
            closeModal()
        }
    }

    return (
        <>
            <BaseDeleteModal
                modalRef={modalRef}
                onSubmit={handleDeleteProblem}
                closeModal={closeModal}
            />
        </>
    )
}

export default DeleteProblemModal