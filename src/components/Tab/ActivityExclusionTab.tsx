import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddActivityExclusionModal from "../Modal/Add/AddActivityExclusionModal";
import ActivityExclusionCard from "../Card/ActivityExclusionCard";

const ActivityExclusionTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="activity-exclusion">
        <div className="my-2">
          <ActivityExclusionCard />
        </div>
      </TabsContent>
      {activeModal.name == "addActivityExclusion" && (
        <AddActivityExclusionModal />
      )}
    </>
  );
};

export default ActivityExclusionTab;
