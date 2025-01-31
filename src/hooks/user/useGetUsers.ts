import { usersList } from "@/mocks/mockUsers"
import { useQuery } from "@tanstack/react-query"

const useGetUsers = () => {
    // to be replaced with real api call
    return useQuery({queryKey: ['users'], queryFn: () => usersList})
}

export default useGetUsers