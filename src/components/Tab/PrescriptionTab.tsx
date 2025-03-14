import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddPrescriptionModal from "../Modal/Add/AddPrescriptionModal";
import DeletePrescriptionModal from "../Modal/Delete/DeletePrescriptionModal";
import EditPrescriptionModal from "../Modal/Edit/EditPrescriptionModal";
import PrescriptionCard from "../Card/PrescriptionCard";

const PrescriptionTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="prescription">
        <div className="my-2">
          <PrescriptionCard />
        </div>
      </TabsContent>
      {activeModal.name === "addPrescription" && <AddPrescriptionModal />}
      {activeModal.name === "deletePrescription" && <DeletePrescriptionModal />}
      {activeModal.name === "editPrescription" && <EditPrescriptionModal />}
    </>
  );
};

export default PrescriptionTab;
