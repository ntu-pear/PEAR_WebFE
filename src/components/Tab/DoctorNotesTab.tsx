import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddDoctorNoteModal from "../Modal/Add/AddDoctorNoteModal";
import EditDoctorNoteModal from "../Modal/Edit/EditDoctorNoteModal";
import DeleteDoctorNoteModal from "../Modal/Delete/DeleteDoctorNoteModal";
import DoctorNotesCard from "../Card/DoctorNotesCard";

const DoctorNotesTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="doctor-notes">
        <div className="my-2">
          <DoctorNotesCard />
        </div>
      </TabsContent>

      {activeModal.name === "addDoctorNote" && <AddDoctorNoteModal />}
      {activeModal.name === "editDoctorNote" && <EditDoctorNoteModal />}
      {activeModal.name === "deleteDoctorNote" && <DeleteDoctorNoteModal />}
    </>
  );
};

export default DoctorNotesTab;
