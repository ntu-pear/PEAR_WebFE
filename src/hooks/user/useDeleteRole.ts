import { useMutation } from "@tanstack/react-query"
import { useModal } from "../useModal";

const useDeleteRole = () => {
    const { closeModal } = useModal();
  
  // to be replaced with real api call
  return useMutation({
    mutationFn: (roleId: string) => {return Promise.resolve(roleId)},
    onSuccess: () => closeModal()
  })
}

export default useDeleteRole