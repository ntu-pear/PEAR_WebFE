import {
  AddPatientPrivacyLevel,
  addPatientPrivacyLevel,
} from "@/api/patients/privacyLevel";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const useAddPatientPrivacyLevel = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      patientId,
      formData,
    }: {
      patientId: number;
      formData: AddPatientPrivacyLevel;
    }) => addPatientPrivacyLevel(patientId, formData),
    onSuccess: () => {
      navigate("/supervisor/manage-patients");
      toast.success("Added patient privacy level successfully");
      queryClient.invalidateQueries({ queryKey: ["patientPrivacyLevel"] });
    },
    onError: () => toast.error("Failed to add patient privacy level."),
  });
};

export default useAddPatientPrivacyLevel;
