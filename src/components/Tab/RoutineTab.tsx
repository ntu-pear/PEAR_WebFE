import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddRoutineModal from "../Modal/Add/AddRoutineModal";
import RoutineCard from "../Card/RoutineCard";
import DeleteRoutineModal from "../Modal/Delete/DeleteRoutineModal";
import EditRoutineModal from "../Modal/Edit/EditRoutineModal";
import DeleteRoutineExclusionModal from "../Modal/Delete/DeleteRoutineExclusionModal";
import EditRoutineExclusionModal from "../Modal/Edit/EditRoutineExclusionModal";
import AddRoutineExclusionModal from "../Modal/Add/AddRoutineExclusionModal";

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
      {activeModal.name == "deleteRoutine" && <DeleteRoutineModal />}
      {activeModal.name == "editRoutine" && <EditRoutineModal />}
      {activeModal.name == "deleteRoutineExclusion" && <DeleteRoutineExclusionModal />}
      {activeModal.name == "editRoutineExclusion" && <EditRoutineExclusionModal/>}
      {activeModal.name == "addRoutineExclusion" && <AddRoutineExclusionModal/>}
    </>
  );
};

export default RoutineTab;
