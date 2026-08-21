import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddDiagnosedDementiaModal from "../Modal/Add/AddDiagnosedDementiaModal";
import DeleteDiagnosedDementiaModal from "../Modal/Delete/DeleteDiagnosedDementiaModal";
import EditDiagnosedDementiaModal from "../Modal/Edit/EditDiagnosedDementiaModal";
import DiagnosedDementiaCard from "../Card/DiagnosedDementiaCard";

const DiagnosedDementiaTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="diagnosed-dementia">
        <div className="my-2">
          <DiagnosedDementiaCard />
        </div>
      </TabsContent>

      {activeModal.name === "addDiagnosedDementia" && <AddDiagnosedDementiaModal />}
      {activeModal.name === "deleteDiagnosedDementia" && <DeleteDiagnosedDementiaModal />}
      {activeModal.name === "editDiagnosedDementia" && <EditDiagnosedDementiaModal />}
    </>
  );
};

export default DiagnosedDementiaTab;
