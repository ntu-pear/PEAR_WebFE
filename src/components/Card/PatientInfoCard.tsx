import { EyeIcon, EyeOffIcon, FilePenLine } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PatientInformation } from "@/mocks/mockPatientDetails";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { fetchPatientPrivacyLevel } from "@/api/patients/privacyLevel";
import { convertPrivacyLevel } from "@/utils/convertPrivacyLevel";

const PatientInfoCard: React.FC = () => {
  const { id, patientInfo, nricData, handleNRICToggle, refreshPatientData, patientAllocation } = useViewPatient();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [accessLevelSensitive, setAccessLevelSensitive] = useState<
    number | null
  >(null);

  const patientInformationColumns = [
    { key: "name", header: "Name" },
    { key: "nric", header: "NRIC" },
    { key: "dateOfBirth", header: "Date Of Birth" },
    { key: "gender", header: "Gender" },
    { key: "address", header: "Address" },
    { key: "tempAddress", header: "Temporary Address" },
    { key: "homeNo", header: "Home No" },
    { key: "handphoneNo", header: "Handphone No" },
    { key: "preferredName", header: "Preferred Name" },
    { key: "preferredLanguage", header: "Preferred Language" },
    {
      key: "accessLevelSensitive",
      header: "Privacy Level",
      customValue: accessLevelSensitive,
    },
    { key: "underRespiteCare", header: "Under Respite Care" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "inactiveDate", header: "Inactive Date" },
  ];

  const refreshPatientPrivacyLevel = async () => {
    if (isNaN(Number(id))) return;
    const response = await fetchPatientPrivacyLevel(Number(id));
    setAccessLevelSensitive(response.accessLevelSensitive);
  };

  useEffect(() => {
    refreshPatientPrivacyLevel();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Information</span>
          {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() =>
                openModal("editPatientInfo", {
                  patientId: String(id),
                  submitterId: currentUser?.userId,
                  refreshPatientData,
                  refreshPatientPrivacyLevel,
                  editableFields:
                    currentUser?.roleName === "SUPERVISOR"?["name","nric","gender","handphoneNo","preferredName","dateOfBirth","homeNo","currAdd","tempAdd","privacyLevel","isRespiteCare","startDate","preferredLanguageId","isActive","endDate"]:
                    patientAllocation?.guardianApplicationUserId === currentUser?.userId?["handphoneNo","preferredName","homeNo","privacyLevel","preferredLanguageId"]
                    :[]
                })
              }
            >
              <FilePenLine className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Edit
              </span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2">
        {/* First Half */}
        <div className="space-y-2">
          {patientInformationColumns
            .slice(0, Math.ceil(patientInformationColumns.length / 2))
            .map((column) => (
              <div key={column.key} className="space-y-1">
                <p className="text-sm font-medium">{column.header}</p>
                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                  {column.key === "nric"
                    ? nricData.nric || "-" //check if nric field
                    : column.key === "accessLevelSensitive" //check if privacy level field
                      ? column.customValue !== null
                        ? convertPrivacyLevel(column.customValue)
                        : "-"
                      : patientInfo?.[
                          column.key as keyof PatientInformation // else if key is not nric or privacy level field
                        ] || "-"}
                  {column.key === "nric" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleNRICToggle}
                      className="h-6 w-6 flex items-center justify-center ml-1"
                    >
                      {nricData.isMasked ? (
                        <EyeOffIcon className="h-5 w-5" /> // Masked
                      ) : (
                        <EyeIcon className="h-5 w-5" /> // Unmasked
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
        {/* Second Half */}
        <div className="space-y-2">
          {patientInformationColumns
            .slice(Math.ceil(patientInformationColumns.length / 2))
            .map((column) => (
              <div key={column.key} className="space-y-1">
                <p className="text-sm font-medium">{column.header}</p>
                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                  {column.key === "nric"
                    ? nricData.nric || "-" //check if nric field
                    : column.key === "accessLevelSensitive" //check if privacy level field
                      ? column.customValue !== null
                        ? convertPrivacyLevel(column.customValue)
                        : "-"
                      : patientInfo?.[
                          column.key as keyof PatientInformation // else if key is not nric or privacy level field
                        ] || "-"}
                  {column.key === "nric" && (
                    <Button
                      size="icon"
                      variant="link"
                      onClick={handleNRICToggle}
                      className="h-6 w-6 flex items-center justify-center ml-1"
                    >
                      {nricData.isMasked ? (
                        <EyeOffIcon className="h-5 w-5" /> // Masked
                      ) : (
                        <EyeIcon className="h-5 w-5" /> // Unmasked
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
