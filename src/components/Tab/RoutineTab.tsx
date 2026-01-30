import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddRoutineModal from "../Modal/Add/AddRoutineModal";
import RoutineCard from "../Card/RoutineCard";
import DeleteRoutineModal from "../Modal/Delete/DeleteRoutineModal";

const RoutineTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="routine">
        <div className="my-2">
          <RoutineCard />
        </div>
      </TabsContent>
      {activeModal.name == "addRoutine" && <AddRoutineModal />}
      {activeModal.name == "deleteRoutine" && <DeleteRoutineModal/>}
    </>
  );
};

export default RoutineTab;
