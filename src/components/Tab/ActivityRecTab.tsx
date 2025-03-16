import ActivityRecCard from "../Card/ActivityRecCard";
import { TabsContent } from "../ui/tabs";

const ActivityRecTab: React.FC = () => {
  return (
    <>
      <TabsContent value="center-activity-recommendation">
        <div className="my-2">
          <ActivityRecCard />
        </div>
      </TabsContent>
    </>
  );
};

export default ActivityRecTab;
