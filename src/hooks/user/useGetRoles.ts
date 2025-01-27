import { mockRolesList } from "@/mocks/mockRoles"
import { useQuery } from "@tanstack/react-query"

const useGetRoles = () => {
    // to be replaced with real api call
    return useQuery({queryKey: ['roles'], queryFn: () => mockRolesList})
}

export default useGetRoles