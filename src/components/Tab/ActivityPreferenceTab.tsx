import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddActivityPreferenceModal from "../Modal/Add/AddActivityPreferenceModal";
import ActivityPreferenceCard from "../Card/ActivityPreferenceCard";

const ActivityPreferenceTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="activity-preference">
        <div className="my-2">
          <ActivityPreferenceCard />
        </div>
      </TabsContent>
      {activeModal.name == "addActivityPreference" && (
        <AddActivityPreferenceModal />
      )}
    </>
  );
};

export default ActivityPreferenceTab;
