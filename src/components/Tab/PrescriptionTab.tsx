import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { DataTableServer } from "../Table/DataTable";
import TabProps from "./types";
import { useModal } from "@/hooks/useModal";
import AddPrescriptionModal from "../Modal/AddPrescriptionModal";
import {
  fetchPatientPrescription,
  PrescriptionTDServer,
} from "@/api/patients/prescription";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DeletePrescriptionModal from "../Modal/DeletePrescriptionModal";
import EditPrescriptionModal from "../Modal/EditPrescriptionModal";

const PrescriptionTab: React.FC<TabProps> = ({ id }) => {
  const { activeModal, openModal } = useModal();
  const [prescription, setPrescription] = useState<PrescriptionTDServer>({
    prescriptions: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });

  const handleFetchPrescription = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;

    try {
      const fetchedPrescription: PrescriptionTDServer =
        await fetchPatientPrescription(Number(id), pageNo);

      setPrescription(fetchedPrescription);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch prescription for patient");
    }
  };

  useEffect(() => {
    console.log("patientId", id);
    refreshPrescriptionData();
  }, []);

  const refreshPrescriptionData = () => {
    handleFetchPrescription(prescription.pagination.pageNo || 0);
  };

  const prescriptionColumns = [
    { key: "drugName", header: "Drug Name", className: "truncate-column" },
    { key: "dosage", header: "Dosage", className: "truncate-column" },
    { key: "frequencyPerDay", header: "Frequency Per Day" },
    { key: "instruction", header: "Instruction", className: "truncate-column" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "afterMeal", header: "After Meal" },
    //{ key: 'remark', header: 'Remark', className: 'truncate-column' },
    { key: "status", header: "Status", className: "truncate-column" },
  ];

  return (
    <>
      <TabsContent value="prescription">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Prescriptions</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addPrescription", {
                    patientId: id,
                    submitterId: "1",
                    refreshPrescriptionData,
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
            <DataTableServer
              data={prescription.prescriptions}
              pagination={prescription.pagination}
              fetchData={handleFetchPrescription}
              columns={prescriptionColumns}
              viewMore={false}
              renderActions={(item) => (
                <div className="flex justify-start flex-col">
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      openModal("editPrescription", {
                        prescriptionId: String(item.id),
                        submitterId: "1",
                        refreshPrescriptionData,
                      });
                    }}
                  >
                    More Details
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal("deletePrescription", {
                        prescriptionId: String(item.id),
                        submitterId: "1",
                        refreshPrescriptionData,
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
      {activeModal.name === "addPrescription" && <AddPrescriptionModal />}
      {activeModal.name === "deletePrescription" && <DeletePrescriptionModal />}
      {activeModal.name === "editPrescription" && <EditPrescriptionModal />}
    </>
  );
};

export default PrescriptionTab;
