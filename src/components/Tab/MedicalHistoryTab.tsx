import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddMedicalHistoryModal from "../Modal/Add/AddMedicalHistoryModal";
import EditMedicalHistoryModal from "../Modal/Edit/EditMedicalHistoryModal";
import DeleteMedicalHistoryModal from "../Modal/Delete/DeleteMedicalHistoryModal";
import MedicalHistoryCard from "../Card/MedicalHistoryCard";

const MedicalHistoryTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="medical-history">
        <div className="my-2">
          <MedicalHistoryCard />
        </div>
      </TabsContent>

      {activeModal.name === "addMedicalHistory" && <AddMedicalHistoryModal />}
      {activeModal.name === "editMedicalHistory" && <EditMedicalHistoryModal />}
      {activeModal.name === "deleteMedicalHistory" && <DeleteMedicalHistoryModal />}
    </>
  );
};

export default MedicalHistoryTab;
