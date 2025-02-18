import { fetchRoles } from "@/api/role/roles"
import { useQuery } from "@tanstack/react-query"

const useGetRoles = () => {
  return useQuery({ queryKey: ['roles'], queryFn: fetchRoles })
}

export default useGetRoles