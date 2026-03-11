import { addPatient, AddPatientSection } from "@/api/patients/patients";
import { queryClient } from "@/App";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const useAddPatient = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);


  const mutation = useMutation({
    mutationFn: (patient: AddPatientSection) => addPatient(patient),
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setTimeout(() => {
        toast.success("Sucessfully added new patient")
        navigate("/supervisor/manage-patients");
      }, 8000);
    },
    onError: () => toast.error("Failed to add patient."),
  });

  return { ...mutation, isSuccess };
};

export default useAddPatient;
