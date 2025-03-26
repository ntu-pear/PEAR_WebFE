import { fetchSocialHistorySensitiveMapping } from "@/api/patients/socialHistorySensitiveMapping";
import { useQuery } from "@tanstack/react-query";

const useGetSocialHistorySensitiveMapping = () => {
  return useQuery({ queryKey: ["socialHistorySensitiveMapping"], queryFn: fetchSocialHistorySensitiveMapping });
};

export default useGetSocialHistorySensitiveMapping;
