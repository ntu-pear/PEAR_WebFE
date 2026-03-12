import { addPatient, AddPatientSection } from "@/api/patients/patients";
// import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";

const useAddPatient = () => {
  const mutation = useMutation({
    mutationFn: (patient: AddPatientSection) => addPatient(patient),
  });

  return mutation;
};

export default useAddPatient;
