import { updateRole } from "@/api/role/roles";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type Variables = {
  roleId: string;
  roleName: string;
  accessLevelSensitive: 0 | 1 | 2 | 3;
};

const useUpdateRoleAccessLevel = () => {
  return useMutation({
    mutationFn: ({ roleId, roleName, accessLevelSensitive }: Variables) =>
      updateRole(roleId, roleName, true, accessLevelSensitive),
    onSuccess: ({ roleName }) => {
      toast.success(`Privacy level of ${roleName} updated successfully`);
      queryClient.refetchQueries({ queryKey: ["roles"] });
    },
    onError: (
      error: { response: { data: { detail: string } } },
      { roleName }
    ) =>
      toast.error(
        `Failed to update access level of ${roleName}. ${error.response.data.detail}`
      ),
  });
};

export default useUpdateRoleAccessLevel;
