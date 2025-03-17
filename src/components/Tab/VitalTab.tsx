import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddVitalModal from "../Modal/Add/AddVitalModal";
import EditVitalModal from "../Modal/Edit/EditVitalModal";
import DeleteVitalModal from "../Modal/Delete/DeleteVitalModal";
import VitalCard from "../Card/VitalCard";

const VitalTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="vital">
        <div className="my-2">
          <VitalCard />
        </div>
      </TabsContent>
      {activeModal.name === "addVital" && <AddVitalModal />}
      {activeModal.name === "editVital" && <EditVitalModal />}
      {activeModal.name === "deleteVital" && <DeleteVitalModal />}
    </>
  );
};

export default VitalTab;
