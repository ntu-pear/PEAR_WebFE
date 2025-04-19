import { fetchSocialHistorySensitiveMapping } from "@/api/patients/socialHistorySensitiveMapping";
import { useQuery } from "@tanstack/react-query";

const useGetSocialHistorySensitiveMapping = () => {
  return useQuery({
    queryKey: ["socialHistorySensitiveMapping"],
    queryFn: fetchSocialHistorySensitiveMapping,
    select: (data) => data.sort((a, b) => a.socialHistoryItem.localeCompare(b.socialHistoryItem)),
  });
};

export default useGetSocialHistorySensitiveMapping;
