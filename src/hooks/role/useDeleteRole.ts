import { useMutation } from "@tanstack/react-query";
import { deleteRole } from "@/api/role/roles";
import { toast } from "sonner";
import { queryClient } from "@/App";

const useDeleteRole = () => {
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: { response: { data: { detail: string } } }) =>
      toast.error(`Failed to delete role. ${error.response.data.detail}`),
  });
};

export default useDeleteRole;
