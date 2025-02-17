import { updateUsersRole } from "@/api/admin/user"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"

type Variables = {
  roleName: string
  userIds: string[]
}

const useEditUsersInRole = () => {
  const navigate = useNavigate()

  // to be replaced with real api call
  return useMutation({
    mutationFn: (variables: Variables) => updateUsersRole(variables.roleName, variables.userIds),
    onSuccess: () => {
      navigate(-1)
      toast.success('Users role updated')
    },
    onError: () => toast.error('Failed to update users role')
  })
}

export default useEditUsersInRole