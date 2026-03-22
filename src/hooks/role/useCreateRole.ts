import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createRole } from "@/api/role/roles";

type CreateRoleInput = {
  roleName: string;
  description?: string;
  accessLevelId: string;
};

const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleInput) => createRole(data),
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create role");
    },
  });
};

export default useCreateRole;