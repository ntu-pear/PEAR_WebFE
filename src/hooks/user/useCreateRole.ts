import { createRole } from "@/api/role/roles"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"

const useCreateRole = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (roleName: string) => createRole(roleName),
    onSuccess: () => {
      navigate(-1)
      toast.success('Role created successfully')
    },
    onError: () => toast.error('Failed to create role'),
  })
}

export default useCreateRole