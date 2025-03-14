import { addPatient, AddPatientSection } from "@/api/patients/patients";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const useAddPatient = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (patient: AddPatientSection) => addPatient(patient),
    onSuccess: () => {
      navigate("/supervisor/manage-patients");
      toast.success("Added patient Successfully");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: () => toast.error("Failed to add patient."),
  });
};

export default useAddPatient;
