import { TabsContent } from "../ui/tabs";
import ActivityExclusionCard from "../Card/ActivityExclusionCard";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

const ActivityExclusionTab: React.FC = () => {
  const { id: patientId } = useViewPatient();
  
  if (!patientId) {
    return (
      <TabsContent value="activity-exclusion">
        <div className="text-center py-8 text-gray-500">
          Patient not found
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="activity-exclusion">
      <div className="my-2">
        <ActivityExclusionCard patientId={patientId} />
      </div>
    </TabsContent>
  );
};

export default ActivityExclusionTab;
