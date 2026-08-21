import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddMobilityAidModal from "../Modal/Add/AddMobilityAidModal";
import EditMobilityAid from "../Modal/Edit/EditMobilityAidModal";
import DeleteMobilityAidModal from "../Modal/Delete/DeleteMobilityAidModal";
import MobilityAidsCard from "../Card/MobilityAidsCard";

const MobilityAidsTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="mobility-aids">
        <div className="my-2">
          <MobilityAidsCard />
        </div>
      </TabsContent>

      {activeModal.name === "addMobilityAids" && <AddMobilityAidModal />}
      {activeModal.name === "editMobilityAids" && <EditMobilityAid />}
      {activeModal.name === "deleteMobilityAids" && <DeleteMobilityAidModal />}
    </>
  );
};

export default MobilityAidsTab;
