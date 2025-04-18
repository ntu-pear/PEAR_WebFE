import { createRole } from "@/api/role/roles";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type Variables = {
  roleName: string;
  accessLevel: 0 | 1 | 2 | 3;
};

const useCreateRole = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ roleName, accessLevel }: Variables) =>
      createRole(roleName, accessLevel),
    onSuccess: () => {
      navigate(-1);
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: { response: { data: { detail: string } } }) =>
      toast.error(`Failed to create role. ${error.response.data.detail}`),
  });
};

export default useCreateRole;
