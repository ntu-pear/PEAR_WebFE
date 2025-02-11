import { mockUsersOfRoles, UserRole } from "@/mocks/mockRoles"
import { useQuery } from "@tanstack/react-query"

const useGetUsersFromRole = (role: UserRole) => {
    // to be replaced with real api call
    return useQuery({queryKey: ['users', role], queryFn: () => mockUsersOfRoles[role]})
}

export default useGetUsersFromRole