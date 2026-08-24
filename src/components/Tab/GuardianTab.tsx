import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddGuardianModal from "../Modal/Add/AddGuardianModal";
import AddExistingGuardianModal from "../Modal/Add/AddExistingGuardianModal";
import EditGuardianModal from "../Modal/Edit/EditGuardianModal";
import UnassignGuardianModal from "../Modal/Delete/UnassignGuardianModal";
import GuardianCard from "../Card/GuardianCard";
import { useAuth } from "@/hooks/useAuth";

const GuardianTab: React.FC = () => {
  const { activeModal } = useModal();
  const { currentUser } = useAuth();
  return (
    <>
      <TabsContent value="guardian">
        <div className="my-2">
          <GuardianCard />
        </div>
      </TabsContent>
      {activeModal.name === "addGuardian" && currentUser?.roleName === "SUPERVISOR" && <AddGuardianModal />}
      {activeModal.name === "addExistingGuardian" && currentUser?.roleName === "SUPERVISOR" && <AddExistingGuardianModal />}
      {activeModal.name === "editGuardian" && currentUser?.roleName === "SUPERVISOR" && <EditGuardianModal />}
      {activeModal.name === "unassignGuardian" && currentUser?.roleName === "SUPERVISOR" && <UnassignGuardianModal />}
    </>
  );
};

export default GuardianTab;
