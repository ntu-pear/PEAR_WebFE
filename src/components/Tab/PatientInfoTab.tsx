import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, FilePenLine, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { DataTableClient, DataTableServer } from "../Table/DataTable";
import {
  DiagnosedDementiaTD,
  MobilityAidTD,
  mockDiagnosedDementiaList,
  mockMediclaDetails,
  mockMobilityAidsTD,
  mockStaffAllocation,
  PatientInformation,
} from "@/mocks/mockPatientDetails";
import TabProps from "./types";
import { useModal } from "@/hooks/useModal";
import EditPatientInfoModal from "../Modal/Edit/EditPatientInfoModal";
import AddMedicalHistoryModal from "../Modal/Add/AddMedicalHistoryModal";
import AddMobilityAidModal from "../Modal/Add/AddMobilityAidModal";
import EditStaffAllocationModal from "../Modal/Edit/EditStaffAllocationModal";
import EditSocialHistoryModal from "../Modal/Edit/EditSocialHistoryModal";
import { toast } from "sonner";
import {
  DoctorNoteTDServer,
  fetchDoctorNotes,
} from "@/api/patients/doctorNote";
import { fetchMobilityAids } from "@/api/patients/mobility";
import {
  fetchSocialHistoryTD,
  SocialHistoryTD,
} from "@/api/patients/socialHistory";
import { fetchDiagnosedDementia } from "@/api/patients/diagnosedDementia";
import AddSocialHistoryModal from "../Modal/Add/AddSocialHistory";
import EditMobilityAid from "../Modal/Edit/EditMobilityAidModal";
import DeleteMobilityAidModal from "../Modal/Delete/DeleteMobilityAidModal";
import { useAuth } from "@/hooks/useAuth";

interface PatientInfoTabProps extends TabProps {
  patientInfo: PatientInformation | null;
  nricData: {
    nric: string;
    isMasked: boolean;
  };
  handleNRICToggle: () => Promise<void>;
  refreshPatientData: () => void;
}

const PatientInfoTab: React.FC<PatientInfoTabProps> = ({
  id,
  patientInfo,
  nricData,
  handleNRICToggle,
  refreshPatientData,
}) => {
  const { currentUser } = useAuth();
  const [diagnosedDementia, setDiagnosedDementia] = useState<
    DiagnosedDementiaTD[]
  >([]);
  const [mobilityAids, setMobilityAids] = useState<MobilityAidTD[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNoteTDServer>({
    doctornotes: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });
  // only true if 404 error for social history, which means patient does not have social history yet.
  const [hasNoSH, setHasNoSH] = useState(false);
  const [socialHistory, setSocialHistory] = useState<SocialHistoryTD | null>(
    null
  );
  const { activeModal, openModal } = useModal();

  const handleFetchDiagnosedDementia = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedDiagnosedDementia: DiagnosedDementiaTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchDiagnosedDementia(Number(id))
          : mockDiagnosedDementiaList;
      setDiagnosedDementia(fetchedDiagnosedDementia);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient diagnosed dementia");
    }
  };

  const handleFetchMobilityAids = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedMobilityAids: MobilityAidTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchMobilityAids(Number(id))
          : mockMobilityAidsTD;

      setMobilityAids(fetchedMobilityAids);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient mobility aids");
    }
  };

  const handleFetchDoctorNotes = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedDoctorNotes: DoctorNoteTDServer = await fetchDoctorNotes(
        Number(id),
        pageNo
      );

      setDoctorNotes(fetchedDoctorNotes);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient doctor notes");
    }
  };

  const handleFetchSocialHistory = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedSocialHistory: SocialHistoryTD = await fetchSocialHistoryTD(
        Number(id)
      );

      setSocialHistory(fetchedSocialHistory);
      setHasNoSH(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasNoSH(true);
      } else {
        toast.error("Failed to fetch patient social history");
      }
    }
  };

  useEffect(() => {
    console.log("patientId", id);
    handleFetchDiagnosedDementia();
    handleFetchMobilityAids();
    handleFetchDoctorNotes(doctorNotes.pagination.pageNo || 0);
    handleFetchSocialHistory();
  }, []);

  const refreshMobilityData = () => {
    handleFetchMobilityAids();
  };

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

  const dementiaColumns = [
    { key: "dementiaType", header: "Dementia Type" },
    { key: "dementiaDate", header: "Dementia Date" },
  ];

  const mediclaDetailsColumns = [
    { key: "medicalDetails", header: "Medical Details" },
    { key: "informationSource", header: "Information Source" },
    { key: "medicalEstimatedDate", header: "Medical Estimated Date" },
    { key: "notes", header: "Notes" },
  ];

  const mobilityAidsColumns = [
    { key: "mobilityAids", header: "Mobility Aids" },
    { key: "remark", header: "Remark" },
    { key: "condition", header: "Condition" },
    { key: "date", header: "Date" },
  ];

  const doctorNotesColumns = [
    { key: "date", header: "Date" },
    { key: "doctorName", header: "Doctor's Name" },
    { key: "notes", header: "Notes" },
  ];

  const staffAllocationColumns = [
    { key: "staffRole", header: "Staff Role" },
    { key: "staffName", header: "Staff Name" },
  ];

  const socialHistoryColumns = [
    { key: "alcoholUse", header: "Alcohol Use" },
    { key: "caffeineUse", header: "Caffeine Use" },
    { key: "diet", header: "Diet" },
    { key: "drugUse", header: "Drug Use" },
    { key: "education", header: "Education" },
    { key: "exercise", header: "Exercise" },
    { key: "liveWith", header: "Live With" },
    { key: "occupation", header: "Occupation" },
    { key: "pet", header: "Pet" },
    { key: "religion", header: "Religion" },
    { key: "secondhandSmoker", header: "Secondhand Smoker" },
    { key: "sexuallyActive", header: "Sexually Active" },
    { key: "tobaccoUse", header: "Tobacco Use" },
  ];

  return (
    <>
      <TabsContent value="information">
        <div className="grid gap-2 md:grid-cols-2">
          <Card className="my-2">
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

          <Card className="my-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Diagonosed Dementia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTableClient
                data={diagnosedDementia}
                columns={dementiaColumns}
                viewMore={false}
                hideActionsHeader={true}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="my-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Medical History</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addMedicalHistory")}
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
              data={mockMediclaDetails}
              columns={mediclaDetailsColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>

        <Card className="my-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Mobility Aids</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addMobilityAids", {
                    patientId: String(id),
                    submitterId: currentUser?.userId,
                    refreshMobilityData,
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
              data={mobilityAids}
              columns={mobilityAidsColumns}
              viewMore={false}
              renderActions={(item) => (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal("editMobilityAids", {
                        mobilityAidId: String(item.id),
                        refreshData: handleFetchMobilityAids,
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
                      openModal("deleteMobilityAids", {
                        mobilityAidId: String(item.id),
                        refreshData: handleFetchMobilityAids,
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

        <Card className="my-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Doctor's Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableServer
              data={doctorNotes.doctornotes}
              pagination={doctorNotes.pagination}
              fetchData={handleFetchDoctorNotes}
              columns={doctorNotesColumns}
              viewMore={false}
              hideActionsHeader={true}
            />
          </CardContent>
        </Card>

        <div className="grid gap-2 md:grid-cols-2">
          <Card className="my-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Staff Allocation</span>
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() => openModal("editStaffAllocation")}
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTableClient
                data={mockStaffAllocation}
                columns={staffAllocationColumns}
                viewMore={false}
                hideActionsHeader={true}
              />
            </CardContent>
          </Card>

          <Card className="my-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Social History</span>

                {hasNoSH ? (
                  <Button
                    size="sm"
                    className="h-8 w-24 gap-1"
                    onClick={() =>
                      openModal("addSocialHistory", {
                        patientId: String(id),
                        submitterId: currentUser?.userId,
                        refreshData: handleFetchSocialHistory,
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add
                    </span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 w-24 gap-1"
                    onClick={() =>
                      openModal("editSocialHistory", {
                        patientId: String(id),
                        submitterId: currentUser?.userId,
                        refreshData: handleFetchSocialHistory,
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
            <CardContent className="grid gap-4 md:grid-cols-2">
              {/* First Half */}
              <div className="space-y-2">
                {socialHistoryColumns
                  .slice(0, Math.ceil(socialHistoryColumns.length / 2))
                  .map((column) => (
                    <div key={column.key} className="space-y-1">
                      <p className="text-sm font-medium">{column.header}</p>
                      <p className="text-sm text-muted-foreground">
                        {socialHistory?.[column.key as keyof SocialHistoryTD] ||
                          "-"}
                      </p>
                    </div>
                  ))}
              </div>
              {/* Second Half */}
              <div className="space-y-2">
                {socialHistoryColumns
                  .slice(Math.ceil(socialHistoryColumns.length / 2))
                  .map((column) => (
                    <div key={column.key} className="space-y-1">
                      <p className="text-sm font-medium">{column.header}</p>
                      <p className="text-sm text-muted-foreground">
                        {socialHistory?.[column.key as keyof SocialHistoryTD] ||
                          "-"}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      {activeModal.name === "editPatientInfo" && <EditPatientInfoModal />}

      {activeModal.name === "addMedicalHistory" && <AddMedicalHistoryModal />}

      {activeModal.name === "addMobilityAids" && <AddMobilityAidModal />}
      {activeModal.name === "editMobilityAids" && <EditMobilityAid />}
      {activeModal.name === "deleteMobilityAids" && <DeleteMobilityAidModal />}

      {activeModal.name === "editStaffAllocation" && (
        <EditStaffAllocationModal />
      )}

      {activeModal.name === "addSocialHistory" && <AddSocialHistoryModal />}
      {activeModal.name === "editSocialHistory" && <EditSocialHistoryModal />}
    </>
  );
};

export default PatientInfoTab;
