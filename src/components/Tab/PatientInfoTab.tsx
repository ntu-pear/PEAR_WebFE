import { TabsContent } from "../ui/tabs";
import TabProps from "./types";
import { useModal } from "@/hooks/useModal";
import EditPatientInfoModal from "../Modal/Edit/EditPatientInfoModal";
import AddMedicalHistoryModal from "../Modal/Add/AddMedicalHistoryModal";
import AddMobilityAidModal from "../Modal/Add/AddMobilityAidModal";
import EditStaffAllocationModal from "../Modal/Edit/EditStaffAllocationModal";
import EditSocialHistoryModal from "../Modal/Edit/EditSocialHistoryModal";
import AddSocialHistoryModal from "../Modal/Add/AddSocialHistory";
import EditMobilityAid from "../Modal/Edit/EditMobilityAidModal";
import DeleteMobilityAidModal from "../Modal/Delete/DeleteMobilityAidModal";
import PatientInfoCard from "../Card/PatientInfoCard";
import DiagnosedDementiaCard from "../Card/DiagnosedDementiaCard";
import MedicalHistoryCard from "../Card/MedicalHistoryCard";
import MobilityAidsCard from "../Card/MobilityAidsCard";
import DoctorNotesCard from "../Card/DoctorNotesCard";
import StaffAllocationCard from "../Card/StaffAllocationCard";
import SocialHistoryCard from "../Card/SocialHistoryCard";

const PatientInfoTab: React.FC<TabProps> = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="information">
        <div className="grid gap-2 md:grid-cols-2">
          <PatientInfoCard />
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
        <div className="grid gap-2 md:grid-cols-2 my-4">
          <StaffAllocationCard />
          <SocialHistoryCard />
        </div>
      </TabsContent>
      {activeModal.name === "editPatientInfo" && <EditPatientInfoModal />}

      {activeModal.name === "addMedicalHistory" && <AddMedicalHistoryModal />}

      {activeModal.name === "addMobilityAids" && <AddMobilityAidModal />}
      {activeModal.name === "editMobilityAids" && <EditMobilityAid />}
      {activeModal.name === "deleteMobilityAids" && <DeleteMobilityAidModal />}

      {activeModal.name === "editStaffAllocation" && (
        <EditStaffAllocationModal />
      )}

      {activeModal.name === "addSocialHistory" && <AddSocialHistoryModal />}
      {activeModal.name === "editSocialHistory" && <EditSocialHistoryModal />}
    </>
  );
};

export default PatientInfoTab;
