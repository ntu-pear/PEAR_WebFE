import { updatePatientProfilePhoto } from "@/api/patients/patients";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

const useUploadPatientPhoto = () => {
  return useMutation({
    mutationFn: ({
      patientId,
      formData,
    }: {
      patientId: number;
      formData: FormData;
    }) => updatePatientProfilePhoto(patientId, formData),
    onSuccess: () => {
      toast.success("Uploaded patient profile photo successfully");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: () => toast.error("Failed to upload patient profile photo."),
  });
};

export default useUploadPatientPhoto;
