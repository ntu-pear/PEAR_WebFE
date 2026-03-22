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
      // Pass only 2 arguments: the ID and the Payload Object
      updateRole(roleId, {
        roleName,
        // Map your 'accessLevelSensitive' to the correct API field
        // Note: Check if your API expects an ID (string) or a Rank (number)
        accessLevelId: String(accessLevelSensitive), 
      }),
    
    // In TanStack Query v5, onSuccess provides (data, variables, context)
    onSuccess: (_data, variables) => {
      toast.success(`Privacy level of ${variables.roleName} updated successfully`);
      // Use invalidateQueries to trigger a background refresh
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },

    onError: (error: any, variables) => {
      const detail = error?.response?.data?.detail || "An unknown error occurred";
      toast.error(`Failed to update ${variables.roleName}. ${detail}`);
    },
  });
};

export default useUpdateRoleAccessLevel;
