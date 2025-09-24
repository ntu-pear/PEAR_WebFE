import { fetchPatientInfo, fetchPatientNRIC } from "@/api/patients/patients";
import { PatientInformation } from "@/mocks/mockPatientDetails";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export interface ViewPatientContextType {
  id: string | undefined;
  patientInfo: PatientInformation | null;
  nricData: {
    nric: string;
    isMasked: boolean;
  };
  handleNRICToggle: () => Promise<void>;
  refreshPatientData: () => Promise<void>;
}

const ViewPatientContext = createContext<ViewPatientContextType | undefined>(
  undefined
);

export const ViewPatientProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { id } = useParams<{ id: string }>();
  const [patientInfo, setPatientInfo] = useState<PatientInformation | null>(
    null
  );
  const [nricData, setNricData] = useState<{ nric: string; isMasked: boolean }>(
    {
      nric: "",
      isMasked: true,
    }
  );

  const handleNRICToggle = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const updatedNric: string = await fetchPatientNRIC(
        Number(id),
        !nricData.isMasked
      );

      setNricData((prevState) => ({
        nric: updatedNric,
        isMasked: !prevState.isMasked,
      }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient NRIC");
    }
  };

  const refreshPatientData = async () => {
    if (!id || isNaN(Number(id))) return;
    console.log("🔄 Refreshing patient data for ID:", id);
    try {
      const fetchedPatientInfo: PatientInformation = await fetchPatientInfo(
        Number(id)
      );

      console.log("✅ Fetched patient info:", fetchedPatientInfo);
      setPatientInfo(fetchedPatientInfo);
      setNricData({
        nric: fetchedPatientInfo.nric,
        isMasked: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error("❌ Failed to fetch patient information:", error);
      toast.error("Failed to fetch patient information");
    }
  };

  useEffect(() => {
    refreshPatientData();
  }, []);

  // Debug patient info state changes
  useEffect(() => {
    console.log("🏥 Patient Info State Changed:", {
      patientInfo,
      id,
      hasData: !!patientInfo
    });
  }, [patientInfo, id]);

  return (
    <ViewPatientContext.Provider
      value={{
        id,
        patientInfo,
        nricData,
        handleNRICToggle,
        refreshPatientData,
      }}
    >
      {children}
    </ViewPatientContext.Provider>
  );
};

export const useViewPatient = () => {
  const context = useContext(ViewPatientContext);
  if (!context) {
    throw new Error(
      "useViewPatient must be used within an ViewPatientProvider"
    );
  }
  return context;
};
