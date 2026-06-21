import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddMedicalHistoryModal from "../Modal/Add/AddMedicalHistoryModal";
import AddMobilityAidModal from "../Modal/Add/AddMobilityAidModal";
import EditMobilityAid from "../Modal/Edit/EditMobilityAidModal";
import DeleteMobilityAidModal from "../Modal/Delete/DeleteMobilityAidModal";
import DiagnosedDementiaCard from "../Card/DiagnosedDementiaCard";
import MedicalHistoryCard from "../Card/MedicalHistoryCard";
import MobilityAidsCard from "../Card/MobilityAidsCard";
import DoctorNotesCard from "../Card/DoctorNotesCard";
import AddDiagnosedDementiaModal from "../Modal/Add/AddDiagnosedDementiaModal";
import DeleteDiagnosedDementiaModal from "../Modal/Delete/DeleteDiagnosedDementiaModal";
import AddDoctorNoteModal from "../Modal/Add/AddDoctorNoteModal";
import DeleteDoctorNoteModal from "../Modal/Delete/DeleteDoctorNoteModal";
import EditDoctorNoteModal from "../Modal/Edit/EditDoctorNoteModal";
import EditMedicalHistoryModal from "../Modal/Edit/EditMedicalHistoryModal";
import DeleteMedicalHistoryModal from "../Modal/Delete/DeleteMedicalHistoryModal";
import EditDiagnosedDementiaModal from "../Modal/Edit/EditDiagnosedDementiaModal";

const MedicalOverviewTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="medical-overview">
        <div className="grid gap-2 md:grid-cols-2 my-2">
          <DiagnosedDementiaCard />
        </div>
        <div className="my-4">
          <MedicalHistoryCard />
        </div>
        <div className="my-4">
          <MobilityAidsCard />
        </div>
        <div className="my-4">
          <DoctorNotesCard />
        </div>
      </TabsContent>

      {activeModal.name === "addDiagnosedDementia" && <AddDiagnosedDementiaModal />}
      {activeModal.name === "deleteDiagnosedDementia" && <DeleteDiagnosedDementiaModal />}
      {activeModal.name === "editDiagnosedDementia" && <EditDiagnosedDementiaModal />}

      {activeModal.name === "addMedicalHistory" && <AddMedicalHistoryModal />}
      {activeModal.name === "editMedicalHistory" && <EditMedicalHistoryModal />}
      {activeModal.name === "deleteMedicalHistory" && <DeleteMedicalHistoryModal />}

      {activeModal.name === "addMobilityAids" && <AddMobilityAidModal />}
      {activeModal.name === "editMobilityAids" && <EditMobilityAid />}
      {activeModal.name === "deleteMobilityAids" && <DeleteMobilityAidModal />}

      {activeModal.name === "addDoctorNote" && <AddDoctorNoteModal />}
      {activeModal.name === "editDoctorNote" && <EditDoctorNoteModal />}
      {activeModal.name === "deleteDoctorNote" && <DeleteDoctorNoteModal />}
    </>
  );
};

export default MedicalOverviewTab;
