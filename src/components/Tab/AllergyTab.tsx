import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddAllergyModal from "../Modal/Add/AddAllergyModal";
import DeleteAllergyModal from "../Modal/Delete/DeleteAllergyModal";
import EditAllergyModal from "../Modal/Edit/EditAllergyModal";

import AllergyCard from "../Card/AllergyCard";

const AllergyTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="allergy">
        <div className="my-2">
          <AllergyCard />
        </div>
      </TabsContent>
      {activeModal.name === "addAllergy" && <AddAllergyModal />}
      {activeModal.name === "editAllergy" && <EditAllergyModal />}
      {activeModal.name === "deleteAllergy" && <DeleteAllergyModal />}
    </>
  );
};

export default AllergyTab;
