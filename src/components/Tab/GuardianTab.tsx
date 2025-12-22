import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddGuardianModal from "../Modal/Add/AddGuardianModal";
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
    </>
  );
};

export default GuardianTab;
