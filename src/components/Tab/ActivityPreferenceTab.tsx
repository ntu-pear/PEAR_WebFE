import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import ActivityPreferenceCard from "../Card/ActivityPreferenceCard";
import EditActivityPreferenceModal from "../Modal/Edit/EditActivityPreferenceModal";

const ActivityPreferenceTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="activity-preference">
        <div className="my-2">
          <ActivityPreferenceCard />
        </div>
      </TabsContent>
      {activeModal.name === "editActivityPreference" && (
        <EditActivityPreferenceModal />
      )}
    </>
  );
};

export default ActivityPreferenceTab;
