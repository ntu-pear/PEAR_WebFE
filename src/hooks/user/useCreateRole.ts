import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const useCreateRole = () => {
  const navigate = useNavigate()

  // to be replaced with real api call
  return useMutation({
    mutationFn: (roleName: string) => {return Promise.resolve(roleName)},
    onSuccess: () => navigate("/Admin/EditRoles")
  })
}

export default useCreateRole