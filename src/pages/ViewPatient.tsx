import { fetchPatientById, PatientBase } from "@/api/patients";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewPatient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientBase | null>(null);

  const handleFetchPatient = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedPatient: PatientBase = await fetchPatientById(Number(id));
      console.log(fetchedPatient);
      setPatient(fetchedPatient);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  useEffect(() => {
    handleFetchPatient();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col min-w-[1400px] max-w-[1400px] container mx-auto px-4">
      {patient?.firstName} {patient?.lastName} {patient?.id}
    </div>
  );
};

export default ViewPatient;
