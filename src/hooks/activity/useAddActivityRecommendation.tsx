import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PATIENT_ACTIVITY_QUERY_KEY } from "./useGetPatientActivity";
import {
  createActivityRecommendation,
  CreateActivityRecommendationPayload,
} from "@/api/activity/activityRecommendation";
import { toast } from "sonner";

const useAddActivityRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRecommendationPayload) => {
      return createActivityRecommendation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_ACTIVITY_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to create doctor recommendation.");
      console.error("Error creating doctor recommendation:", error);
    },
  });
};

export default useAddActivityRecommendation;
