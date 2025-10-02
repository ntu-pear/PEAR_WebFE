import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import PatientActivityPreferenceCard from "../Card/PatientActivityPreferenceCard";
import EditActivityPreferenceModal from "../Modal/Edit/EditActivityPreferenceModal";

const ActivityPreferenceTab: React.FC = () => {
  const { activeModal } = useModal();
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
    <>
      <TabsContent value="activity-preference">
        <div className="my-2">
          <PatientActivityPreferenceCard 
            patientId={patientId}
          />
        </div>
      </TabsContent>
      {activeModal.name === "editActivityPreference" && (
        <EditActivityPreferenceModal />
      )}
    </>
  );
};

export default ActivityPreferenceTab;
