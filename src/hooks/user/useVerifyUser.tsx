import { verifyUser, VerifyUserForm } from "@/api/users/user";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type Variables = {
  user: VerifyUserForm;
  token: string;
}

const useVerifyUser = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (variables: Variables) => verifyUser(variables.user, variables.token),
    onSuccess: () => {
      navigate('/');
      toast.success("Account successfully verified.");
    },
    onError: (error: { response: { data: { detail: string } } }) => toast.error(
      "Failed to verify user. " + error.response.data.detail
    ),
  });
};

export default useVerifyUser;
