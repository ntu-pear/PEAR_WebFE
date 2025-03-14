import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddProblemModal from "../Modal/Add/AddProblemModal";
import ProblemHistoryCard from "../Card/ProblemHistoryCard";

//Renamed to Problem History from Problem Log to avoid confusion with logs from logging service
const ProblemHistoryTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="problem-history">
        <div className="my-2">
          <ProblemHistoryCard />
        </div>
      </TabsContent>
      {activeModal.name === "addProblem" && <AddProblemModal />}
    </>
  );
};

export default ProblemHistoryTab;
