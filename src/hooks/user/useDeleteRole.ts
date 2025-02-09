import { useMutation } from "@tanstack/react-query"
import { deleteRole } from "@/api/role/roles";
import { toast } from "sonner";

const useDeleteRole = () => {
  
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => toast.success('Role deleted successfully'),
    onError: () => toast.error('Failed to delete role')
  })
}

export default useDeleteRole