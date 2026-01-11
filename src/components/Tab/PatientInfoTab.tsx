import { TabsContent } from "../ui/tabs";
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
import AddDiagnosedDementiaModal from "../Modal/Add/AddDiagnosedDementiaModal";
import DeleteDiagnosedDementiaModal from "../Modal/Delete/DeleteDiagnosedDementiaModal";
import AddDoctorNoteModal from "../Modal/Add/AddDoctorNoteModal";
import DeleteDoctorNoteModal from "../Modal/Delete/DeleteDoctorNoteModal";
import EditDoctorNoteModal from "../Modal/Edit/EditDoctorNoteModal";
import AddStaffAllocationModal from "../Modal/Add/AddStaffAllocationModal";

const PatientInfoTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="information">
        <div className="grid gap-2 md:grid-cols-2 my-2">
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
      {activeModal.name === "addDiagnosedDementia" && (
        <AddDiagnosedDementiaModal />
      )}
      {activeModal.name === "deleteDiagnosedDementia" && (
        <DeleteDiagnosedDementiaModal />
      )}
      {activeModal.name === "addMedicalHistory" && <AddMedicalHistoryModal />}

      {activeModal.name === "addMobilityAids" && <AddMobilityAidModal />}
      {activeModal.name === "editMobilityAids" && <EditMobilityAid />}
      {activeModal.name === "deleteMobilityAids" && <DeleteMobilityAidModal />}

      {activeModal.name === "addDoctorNote" && <AddDoctorNoteModal />}
      {activeModal.name === "editDoctorNote" && <EditDoctorNoteModal />}
      {activeModal.name === "deleteDoctorNote" && <DeleteDoctorNoteModal />}

      {activeModal.name === "editStaffAllocation" && (
        <EditStaffAllocationModal
          allocationId={activeModal.props.allocationId as number}
          patientId={activeModal.props.patientId as number}
          doctorId={activeModal.props.doctorId as string}
          gametherapistId={activeModal.props.gametherapistId as string}
          supervisorId={activeModal.props.supervisorId as string}
          caregiverId={activeModal.props.caregiverId as string}
          guardianId={activeModal.props.guardianId as number}
        />
      )}
      {activeModal.name === "addStaffAllocation" && (
        <AddStaffAllocationModal
          allocationId={activeModal.props.allocationId as number}
          patientId={activeModal.props.patientId as number}
          guardianId={activeModal.props.guardianId as number}
        />
      )}

      {activeModal.name === "addSocialHistory" && <AddSocialHistoryModal />}
      {activeModal.name === "editSocialHistory" && <EditSocialHistoryModal />}
    </>
  );
};

export default PatientInfoTab;
