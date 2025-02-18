import { getUsersFromRole } from "@/api/role/roles"
import { useQuery } from "@tanstack/react-query"

const useGetUsersFromRole = (roleName: string) => {
  return useQuery({ queryKey: ['users', roleName], queryFn: () => getUsersFromRole(roleName) })
}

export default useGetUsersFromRole