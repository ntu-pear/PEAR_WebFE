import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/api/admin/user";
import { toast } from "sonner";

const ADMIN_ROLE = "ADMIN";

export const useUserRoleManagement = () => {
  const assignMutation = useMutation({
    mutationFn: ({
      userId,
      targetRoleName,
    }: {
      userId: string;
      targetRoleName: string;
    }) => updateUser(userId, { roleName: targetRoleName }),

    onSuccess: () => {
      toast.success("User assigned");

      // Force hard refresh so all pages/data reload from backend
      window.location.reload();
    },

    onError: () => {
      toast.error("Failed to assign user");
    },
  });

  const safeAssign = (
    user: any,
    targetRoleName: string,
    isAdminWorkbench: boolean
  ) => {
    if (!targetRoleName) {
      toast.error("No target role selected");
      return;
    }

    if (isAdminWorkbench || user.roleName === ADMIN_ROLE) {
      toast.error("Admin cannot be modified");
      return;
    }

    assignMutation.mutate({
      userId: user.id,
      targetRoleName,
    });
  };

  return {
    safeAssign,
    isProcessing: assignMutation.isPending,
  };
};