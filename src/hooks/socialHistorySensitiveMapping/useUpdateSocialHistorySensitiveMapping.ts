import { updateSocialHistorySensitiveMapping } from "@/api/patients/socialHistorySensitiveMapping";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateSocialHistorySensitiveMapping = () => {
  return useMutation({
    mutationFn: (socialHistoryMappings: { socialHistoryItem: string; isSensitive: boolean }[]) =>
      updateSocialHistorySensitiveMapping(socialHistoryMappings),
    onSuccess: () => {
      toast.success(`Social history privacy settings updated successfully`);
      queryClient.refetchQueries({ queryKey: ["socialHistorySensitiveMapping"] });
    },
    onError: (error: { response: { data: { detail: string } } }) =>
      toast.error(`Failed to update privacy settings. ${error.response.data.detail}`),
  });
};

export default useUpdateSocialHistorySensitiveMapping;
