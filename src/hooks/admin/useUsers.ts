import { useQuery, keepPreviousData } from "@tanstack/react-query"; // 1. Import helper
import { fetchUsersByFields } from "@/api/admin/user";

export const useUsers = (page: number, search: string) => {
  return useQuery({
    queryKey: ["users", page, search],
    queryFn: () =>
      fetchUsersByFields(page, 10, {
        nric_FullName: search,
      }),
    // 2. Replace keepPreviousData: true with this:
    placeholderData: keepPreviousData, 
  });
};