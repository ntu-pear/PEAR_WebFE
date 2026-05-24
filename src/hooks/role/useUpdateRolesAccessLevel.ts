import { updateRole } from "@/api/role/roles";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type Variables = {
  roleId: string;
  roleName: string;
  accessLevelId: string;
};

const useUpdateRoleAccessLevel = () => {
  return useMutation({
    mutationFn: ({ roleId, accessLevelId }: Variables) =>
      updateRole(roleId, { accessLevelId }),

    onSuccess: (_data, { roleName }) => {
      toast.success(`Access level of ${roleName} updated successfully`);
      queryClient.refetchQueries({ queryKey: ["roles"] });
    },

    onError: (
      error: { response?: { data?: { detail?: string } } },
      { roleName }
    ) =>
      toast.error(
        `Failed to update access level of ${roleName}. ${
          error.response?.data?.detail || "Unknown error"
        }`
      ),
  });
};

export default useUpdateRoleAccessLevel;