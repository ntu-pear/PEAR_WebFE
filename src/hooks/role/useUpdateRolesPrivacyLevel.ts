import { updateRole } from "@/api/role/roles";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type Variables = {
  roleId: string;
  roleName: string;
  privacyLevelSensitive: 0 | 1 | 2 | 3;
}

const useUpdateRolePrivacyLevel = () => {
  return useMutation({
    mutationFn: ({ roleId, roleName, privacyLevelSensitive }: Variables) =>
      updateRole(roleId, roleName, true, privacyLevelSensitive),
    onSuccess: ({ roleName }) => {
      toast.success(`Privacy level of ${roleName} updated successfully`);
      queryClient.refetchQueries({ queryKey: ["roles"] });
    },
    onError: (error: { response: { data: { detail: string } } }, { roleName }) =>
      toast.error(`Failed to update privacy level of ${roleName}. ${error.response.data.detail}`),
  });
};

export default useUpdateRolePrivacyLevel;
