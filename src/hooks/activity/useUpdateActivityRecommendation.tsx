import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PATIENT_ACTIVITY_QUERY_KEY } from "./useGetPatientActivity";
import {
  updateActivityRecommendation,
  UpdateActivityRecommendationPayload,
} from "@/api/activity/activityRecommendation";
import { toast } from "sonner";

const useUpdateActivityRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateActivityRecommendationPayload) => {
      return updateActivityRecommendation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_ACTIVITY_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to update doctor recommendation.");
      console.error("Error updating doctor recommendation:", error);
    },
  });
};

export default useUpdateActivityRecommendation;
