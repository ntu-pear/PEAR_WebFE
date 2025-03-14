import { EyeIcon, EyeOffIcon, FilePenLine } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PatientInformation } from "@/mocks/mockPatientDetails";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

const PatientInfoCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { id, patientInfo, nricData, handleNRICToggle, refreshPatientData } =
    useViewPatient();
  const { openModal } = useModal();

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
    { key: "privacyLevel", header: "Privacy Level" },
    { key: "underRespiteCare", header: "Under Respite Care" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "inactiveDate", header: "Inactive Date" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Information</span>
          <Button
            size="sm"
            className="h-8 w-24 gap-1"
            onClick={() =>
              openModal("editPatientInfo", {
                patientId: String(id),
                submitterId: currentUser?.userId,
                refreshPatientData,
              })
            }
          >
            <FilePenLine className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Edit
            </span>
          </Button>
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
                    ? nricData.nric || "-"
                    : patientInfo?.[
                        column.key as keyof PatientInformation // else if key is not nric
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
                    ? nricData.nric || "-"
                    : patientInfo?.[
                        column.key as keyof PatientInformation // else if key is not nric
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
