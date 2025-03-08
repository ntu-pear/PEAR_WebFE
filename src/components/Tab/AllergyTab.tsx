import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { DataTableClient } from "../Table/DataTable";
import { AllergyTD, mockAllergyTD } from "@/mocks/mockPatientDetails";
import TabProps from "./types";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import AddAllergyModal from "../Modal/AddAllergyModal";
import { fetchPatientAllergy } from "@/api/patients/allergy";
import { toast } from "sonner";
import DeleteAllergyModal from "../Modal/DeleteAllergyModal";
import EditAllergyModal from "../Modal/EditAllergyModal";

const AllergyTab: React.FC<TabProps> = ({ id }) => {
  const [allergy, setAllergy] = useState<AllergyTD[]>([]);
  const { activeModal, openModal } = useModal();

  const handleFetchAllergy = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedAllergy: AllergyTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchPatientAllergy(Number(id))
          : mockAllergyTD;

      setAllergy(fetchedAllergy);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch allergy for patient");
    }
  };

  useEffect(() => {
    console.log("patientId", id);
    handleFetchAllergy();
  }, []);

  const refreshAllergyData = () => {
    handleFetchAllergy();
  };

  const allergyColumns = [
    { key: "allergicTo", header: "Allergic To", width: "15%" },
    { key: "reaction", header: "Reaction", width: "15%" },
    { key: "notes", header: "Notes", width: "50%" },
  ];

  return (
    <>
      <TabsContent value="allergy">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Allergy</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addAllergy", {
                    patientId: id,
                    submitterId: "1",
                    refreshAllergyData,
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={allergy}
              columns={allergyColumns}
              viewMore={false}
              renderActions={(item) => (
                <div className="flex space-x-2 w-[75px] sm:w-[150px]">
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal("editAllergy", {
                        allergyId: item.id,
                        patientId: id,
                        refreshAllergyData,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal("deleteAllergy", {
                        allergyId: item.id,
                        refreshAllergyData,
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name === "addAllergy" && <AddAllergyModal />}
      {activeModal.name === "editAllergy" && <EditAllergyModal />}
      {activeModal.name === "deleteAllergy" && <DeleteAllergyModal />}
    </>
  );
};

export default AllergyTab;
