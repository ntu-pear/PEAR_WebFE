import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getUsersFromRole } from "@/api/role/roles";

export const USERS_FROM_ROLE_QUERY_KEY = "roster";

const useGetUsersFromRole = (roleName?: string) => {
  return useQuery({
    queryKey: [USERS_FROM_ROLE_QUERY_KEY, roleName],
    queryFn: () => getUsersFromRole(roleName as string),
    enabled: !!roleName,
    placeholderData: keepPreviousData,
  });
};

export default useGetUsersFromRole;