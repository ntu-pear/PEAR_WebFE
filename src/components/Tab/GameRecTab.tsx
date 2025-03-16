import DementiaGameRecCard from "../Card/DementiaGameRecCard";
import IndivGameRecCard from "../Card/IndivGameRecCard";
import { TabsContent } from "../ui/tabs";

const GameRecTab: React.FC = () => {
  return (
    <>
      <TabsContent value="game-recommendation">
        <div className="my-2">
          <IndivGameRecCard />
        </div>
        <div className="my-4">
          <DementiaGameRecCard />
        </div>
      </TabsContent>
    </>
  );
};

export default GameRecTab;
