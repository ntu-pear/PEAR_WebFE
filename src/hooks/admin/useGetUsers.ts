import { fetchUsers } from "@/api/admin/user"
import { useQuery } from "@tanstack/react-query"

const useGetUsers = () => {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers })
}

export default useGetUsers