import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddProblemModal from "../Modal/Add/AddProblemModal";
import ProblemHistoryCard from "../Card/ProblemHistoryCard";
import DeleteProblemModal from "../Modal/Delete/DeleteProblemModal";
import EditProblemModal from "../Modal/Edit/EditProblemModal";

//Renamed to Problem History from Problem Log to avoid confusion with logs from logging service
const ProblemHistoryTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="problem-log">
        <div className="my-2">
          <ProblemHistoryCard />
        </div>
      </TabsContent>
      {activeModal.name === "addProblem" && <AddProblemModal />}
      {activeModal.name === "deleteProblem" && <DeleteProblemModal/>}
      {activeModal.name ==="editProblem" && <EditProblemModal/>}
    </>
  );
};

export default ProblemHistoryTab;
