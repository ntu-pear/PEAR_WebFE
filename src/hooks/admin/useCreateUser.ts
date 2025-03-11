import { createUser, User } from "@/api/admin/user";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const useCreateUser = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (user: Partial<User>) => createUser(user),
    onSuccess: () => {
      navigate('/admin/manage-accounts');
      toast.success("New user successfully registered. Confirmation link has been sent to registered email");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: { response: { data: { detail: string } } }) => toast.error(
      "Failed to create user. " + error.response.data.detail
    ),
  });
};

export default useCreateUser;
