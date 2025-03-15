import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";
import {
  VitalCheckTD,
  VitalCheckTDServer,
  fetchVitals,
} from "@/api/patients/vital";

const VitalCard: React.FC = () => {
  const { id } = useViewPatient();
  const [vitalCheck, setVitalCheck] = useState<VitalCheckTDServer>({
    vitals: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });
  const { openModal } = useModal();
  const { currentUser } = useAuth();

  const handleFetchVitalCheck = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedVitalCheck: VitalCheckTDServer = await fetchVitals(
        Number(id),
        pageNo
      );

      setVitalCheck(fetchedVitalCheck);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch vital for patient");
    }
  };

  useEffect(() => {
    console.log("patientId", id);
    refreshVitalData();
  }, []);

  const refreshVitalData = () => {
    handleFetchVitalCheck(vitalCheck.pagination.pageNo || 0);
  };

  const vitalCheckColumns = [
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "temperature", header: "Temperature (°C)" },
    { key: "weight", header: "Weight (kg)" },
    { key: "height", header: "Height (m)" },
    { key: "systolicBP", header: "Systolic BP (mmHg)" },
    { key: "diastolicBP", header: "Diastolic BP (mmHg)" },
    { key: "heartRate", header: "Heart Rate (bpm)" },
    { key: "spO2", header: "SpO2 (%)" },
    { key: "bloodSugarLevel", header: "Blood Sugar Level (mmol/L)" },
    { key: "afterMeal", header: "After Meal" },
    { key: "remark", header: "Remark" },
  ];

  const renderActions = (item: VitalCheckTD) => {
    return (
      currentUser?.roleName === "SUPERVISOR" && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("editVital", {
                vitalId: String(item.id),
                vitalData: item,
                patientId: String(id),
                submitterId: currentUser?.userId,
                refreshVitalData,
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
              openModal("deleteVital", {
                vitalId: String(item.id),
                refreshVitalData,
              })
            }
          >
            Delete
          </Button>
        </div>
      )
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Vital Checks</span>
            {currentUser?.roleName === "SUPERVISOR" && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addVital", {
                    patientId: id,
                    submitterId: currentUser?.userId,
                    refreshVitalData,
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableServer
            data={vitalCheck.vitals}
            pagination={vitalCheck.pagination}
            fetchData={handleFetchVitalCheck}
            columns={vitalCheckColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default VitalCard;
