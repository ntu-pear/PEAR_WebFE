import { fetchPreferredLanguageList } from "@/api/patients/preferredLanguage";
import { useQuery } from "@tanstack/react-query";

const useGetPreferredLanguageList = () => {
  return useQuery({
    queryKey: ["preferredLanguageList"],
    queryFn: () => fetchPreferredLanguageList(),
  });
};

export default useGetPreferredLanguageList;
