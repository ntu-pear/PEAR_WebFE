import { useQuery } from "@tanstack/react-query";
import { fetchUsersByFields } from "@/api/admin/user";

export const useUsers = (page: number, search: string) => {
  return useQuery({
    queryKey: ["users", page, search],
    queryFn: () =>
      fetchUsersByFields(page, 10, {
        nric_FullName: search,
      }),
    keepPreviousData: true,
  });
};