import { TabsContent } from "../ui/tabs";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import PatientActivityPreferenceCard from "../Card/PatientActivityPreferenceCard";

const ActivityPreferenceTab: React.FC = () => {
  const { id: patientId } = useViewPatient();

  if (!patientId) {
    return (
      <TabsContent value="activity-preference">
        <div className="my-2 text-center text-muted-foreground">
          Patient information is not available.
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="activity-preference">
      <div className="my-2">
        <PatientActivityPreferenceCard 
          patientId={patientId}
        />
      </div>
    </TabsContent>
  );
};

export default ActivityPreferenceTab;
