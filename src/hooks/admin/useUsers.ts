import { useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  AccountTableDataServer,
  ExportUserFilters,
  fetchUsersByFields,
} from "@/api/admin/user";

export const USERS_QUERY_KEY = "users";

export const useUsers = (
  pageNo: number,
  pageSize: number,
  search: string,
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
) => {
  const normalizedSearch = search.trim();

  const filters = useMemo<ExportUserFilters>(() => {
    if (!normalizedSearch) return {};

    return {
      nric_FullName: normalizedSearch,
    };
  }, [normalizedSearch]);

  return useQuery<AccountTableDataServer>({
    queryKey: [
      USERS_QUERY_KEY,
      pageNo,
      pageSize,
      normalizedSearch,
      sortBy ?? null,
      sortDir,
    ],
    queryFn: () =>
      fetchUsersByFields(
        pageNo,
        pageSize,
        filters,
        sortBy ?? null,
        sortDir
      ),
    placeholderData: keepPreviousData,
  });
};