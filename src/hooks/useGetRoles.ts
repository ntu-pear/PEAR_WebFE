import { mockRolesList } from "@/mocks/mockRoles"
import { useQuery } from "@tanstack/react-query"

const useGetRoles = () => {
    return useQuery({queryKey: ['roles'], queryFn: () => mockRolesList})
}

export default useGetRoles