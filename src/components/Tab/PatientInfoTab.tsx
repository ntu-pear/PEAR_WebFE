import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import EditPatientInfoModal from "../Modal/Edit/EditPatientInfoModal";
import EditStaffAllocationModal from "../Modal/Edit/EditStaffAllocationModal";
import EditSocialHistoryModal from "../Modal/Edit/EditSocialHistoryModal";
import AddSocialHistoryModal from "../Modal/Add/AddSocialHistory";
import PatientInfoCard from "../Card/PatientInfoCard";
import StaffAllocationCard from "../Card/StaffAllocationCard";
import SocialHistoryCard from "../Card/SocialHistoryCard";
import AddStaffAllocationModal from "../Modal/Add/AddStaffAllocationModal";

const PatientInfoTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="information">
        <div className="my-2">
          <PatientInfoCard />
        </div>
        <div className="grid gap-2 md:grid-cols-2 my-4">
          <StaffAllocationCard />
          <SocialHistoryCard />
        </div>
      </TabsContent>

      {activeModal.name === "editPatientInfo" && <EditPatientInfoModal />}

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
