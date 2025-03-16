import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddRoutineModal from "../Modal/Add/AddRoutineModal";
import RoutineCard from "../Card/RoutineCard";

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
    </>
  );
};

export default RoutineTab;
