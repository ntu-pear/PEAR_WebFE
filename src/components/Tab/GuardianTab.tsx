import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddGuardianModal from "../Modal/Add/AddGuardianModal";
import GuardianCard from "../Card/GuardianCard";

const GuardianTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="guardian">
        <div className="my-2">
          <GuardianCard />
        </div>
      </TabsContent>
      {activeModal.name === "addGuardian" && <AddGuardianModal />}
    </>
  );
};

export default GuardianTab;
