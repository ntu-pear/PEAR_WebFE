import { useModal } from "@/hooks/useModal";
import ActivityRecCard from "../Card/ActivityRecCard";
import { TabsContent } from "../ui/tabs";
import AddActivityRecommendationModal from "../Modal/Add/AddActivityRecommendationModal";
import EditActivityRecommendationModal from "../Modal/Edit/EditActivityRecommendationModal";

const ActivityRecTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="center-activity-recommendation">
        <div className="my-2">
          <ActivityRecCard />
        </div>
      </TabsContent>
      {activeModal.name === "addActivityRecommendation" && (
        <AddActivityRecommendationModal />
      )}
      {activeModal.name === "editActivityRecommendation" && (
        <EditActivityRecommendationModal />
      )}
    </>
  );
};

export default ActivityRecTab;
