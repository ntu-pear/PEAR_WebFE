import { fetchRoleNames } from "@/api/role/roles";
import { useQuery } from "@tanstack/react-query";

const useGetRoleNames = () => {
  return useQuery({ queryKey: ["roleNames"], queryFn: fetchRoleNames });
};

export default useGetRoleNames;
