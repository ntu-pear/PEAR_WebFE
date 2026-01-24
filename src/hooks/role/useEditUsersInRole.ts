import { updateUsersRole } from "@/api/admin/user";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type Variables = {
  roleName: string;
  userIds: string[];
};

const useEditUsersInRole = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (variables: Variables) =>
      updateUsersRole(variables.roleName, variables.userIds),
    onSuccess: () => {
      navigate(-1);
      toast.success("Users role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      // Case 1: you threw a custom object like { status, message, detail }
      const detailFromCustom = error?.detail;

      // Case 2: raw axios error shape
      const detailFromAxios = error?.response?.data?.detail;

      const detail = detailFromCustom ?? detailFromAxios;

      // Plain string detail
      if (typeof detail === "string") {
        toast.error(`Failed to update users role. ${detail}`);
        return;
      }

      // Structured detail
      const message =
        error?.message ??
        detail?.message ??
        "Failed to update users role.";

      const conflicts = detail?.conflicts ?? [];
      if (Array.isArray(conflicts) && conflicts.length > 0) {
        const first = conflicts[0];
        const extra =
          first?.error ??
          `${first?.FullName ?? "User"} already has role${first?.current_role ? ` ${first.current_role}` : ""}.`;

        toast.error(`${message} ${extra}`);
        return;
      }

      toast.error(message);
    },
  });
};

export default useEditUsersInRole;
