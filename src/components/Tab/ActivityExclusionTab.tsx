import { TabsContent } from "../ui/tabs";
import ActivityExclusionCard from "../Card/ActivityExclusionCard";

const ActivityExclusionTab: React.FC = () => {
  return (
    <TabsContent value="activity-exclusion">
      <div className="my-2">
        <ActivityExclusionCard />
      </div>
    </TabsContent>
  );
};

export default ActivityExclusionTab;
