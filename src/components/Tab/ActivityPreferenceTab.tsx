import { TabsContent } from "../ui/tabs";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import PatientActivityPreferenceCard from "../Card/PatientActivityPreferenceCard";

interface ActivityPreferenceTabProps {
  canEdit?: boolean;
}

const ActivityPreferenceTab: React.FC<ActivityPreferenceTabProps> = ({ canEdit = true }) => {
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
          canEdit={canEdit}
        />
      </div>
    </TabsContent>
  );
};

export default ActivityPreferenceTab;
