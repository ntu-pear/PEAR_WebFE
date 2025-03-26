import { getGuardian } from "@/api/admin/user";
import { useQuery } from "@tanstack/react-query";

const useGetGuardian = (nric: string) => {
  return useQuery({
    enabled: !!nric,
    queryKey: ["users"],
    queryFn: () => getGuardian(nric),
  });
};

export default useGetGuardian;
