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
    onError: (error: { response: { data: { detail: string } } }) =>
      toast.error(`Failed to update users role. ${error.response.data.detail}`),
  });
};

export default useEditUsersInRole;
