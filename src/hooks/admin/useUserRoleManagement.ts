import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/api/admin/user";
import { toast } from "sonner";

const ADMIN_ROLE = "ADMIN";

// type RemovePayload = {
//   userId: string;
//   onSuccessCallback?: () => void;
// };

export const useUserRoleManagement = (roleName: string) => {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["roster", roleName] });
  };

  // ✅ ASSIGN USER
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
      refresh();
    },

    onError: () => {
      toast.error("Failed to assign user");
    },
  });

  // // ✅ REMOVE USER (WITH CALLBACK SUPPORT)
  // const removeMutation = useMutation({
  //   mutationFn: ({ userId }: RemovePayload) =>
  //     updateUser(userId, { roleName: "" }),

  //   onSuccess: (_, variables: RemovePayload) => {
  //     toast.success("User removed");
  //     refresh();

  //     // 🔥 trigger orphan modal
  //     variables.onSuccessCallback?.();
  //   },

  //   onError: () => {
  //     toast.error("Failed to remove user");
  //   },
  // });

  // ✅ SAFE ASSIGN
  const safeAssign = (
  user: any,
  targetRoleName: string,
  isAdminWorkbench: boolean
) => {
  if (isAdminWorkbench || user.roleName === ADMIN_ROLE) {
    toast.error("Admin cannot be modified");
    return;
  }

  assignMutation.mutate({
    userId: user.id,
    targetRoleName,
  });
};

  // // ✅ SAFE REMOVE
  // const safeRemove = (
  //   user: any,
  //   isAdminWorkbench: boolean,
  //   onSuccessCallback?: () => void
  // ) => {
  //   if (isAdminWorkbench || user.roleName === ADMIN_ROLE) {
  //     toast.error("Admin cannot be modified");
  //     return;
  //   }

  //   removeMutation.mutate({
  //     userId: user.id,
  //     onSuccessCallback,
  //   });
  // };

  // ✅ CRITICAL RETURN (this was missing before)
  return {
    safeAssign,
    // safeRemove,
    isProcessing:
      assignMutation.isPending, 
  };
};