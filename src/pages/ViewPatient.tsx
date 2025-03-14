import { fetchPatientInfo, fetchPatientNRIC } from "@/api/patients/patients";
import React, { Suspense, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { PatientInformation } from "@/mocks/mockPatientDetails";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import UploadProfilePhotoModal from "@/components/Modal/UploadProfilePhotoModal";
import ConfirmProfilePhotoModal from "@/components/Modal/ConfirmProfilePhotoModal";
import DeleteProfilePhotoModal from "@/components/Modal/DeleteProfilePhotoModal";

const AllergyTab = React.lazy(() => import("@/components/Tab/AllergyTab"));
const GuardianTab = React.lazy(() => import("@/components/Tab/GuardianTab"));
const PatientInfoTab = React.lazy(
  () => import("@/components/Tab/PatientInfoTab")
);
const VitalTab = React.lazy(() => import("@/components/Tab/VitalTab"));
const PersonalPreferenceTab = React.lazy(
  () => import("@/components/Tab/PersonalPreferenceTab")
);
const PrescriptionTab = React.lazy(
  () => import("@/components/Tab/PrescriptionTab")
);
const ProblemLogTab = React.lazy(
  () => import("@/components/Tab/ProblemLogTab")
);
const RoutineTab = React.lazy(() => import("@/components/Tab/RoutineTab"));
const PhotoAlbumTab = React.lazy(
  () => import("@/components/Tab/PhotoAlbumTab")
);
const ActivityPreferenceTab = React.lazy(
  () => import("@/components/Tab/ActivityPreferenceTab")
);
const ActivityExclusionTab = React.lazy(
  () => import("@/components/Tab/ActivityExclusionTab")
);

const ViewPatient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab =
    new URLSearchParams(location.search).get("tab") || "information";
  const [patientInfo, setPatientInfo] = useState<PatientInformation | null>(
    null
  );
  const [nricData, setNricData] = useState<{ nric: string; isMasked: boolean }>(
    {
      nric: "",
      isMasked: true,
    }
  );
  const { activeModal, openModal } = useModal();

  const handleNRICToggle = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const updatedNric: string = await fetchPatientNRIC(
        Number(id),
        !nricData.isMasked
      );

      setNricData({
        nric: updatedNric,
        isMasked: !nricData.isMasked,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient NRIC");
    }
  };

  const refreshPatientData = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedPatientInfo: PatientInformation = await fetchPatientInfo(
        Number(id)
      );

      setPatientInfo(fetchedPatientInfo);
      setNricData({
        nric: fetchedPatientInfo.nric,
        isMasked: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient information");
    }
  };

  const handleTabChange = (value: string) => {
    // Update the URL with the new tab
    navigate({
      pathname: location.pathname,
      search: `?tab=${value}`, // Set the selected tab in the URL query
    });
  };

  useEffect(() => {
    refreshPatientData();
  }, []);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
        <div className="container mx-auto p-4">
          <div className="flex items-center space-x-6 mb-8 sm:pl-14">
            <div className="relative inline-block group">
              <Avatar className="h-36 w-36">
                <AvatarImage
                  src={patientInfo?.profilePicture}
                  alt={patientInfo?.name}
                />
                <AvatarFallback>
                  <p className="text-5xl">
                    {patientInfo?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </p>
                </AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="absolute bottom-2 left-2">
                    Edit
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() =>
                      openModal("uploadProfilePhoto", {
                        refreshProfile: refreshPatientData,
                        isUser: false,
                        patientId: id,
                      })
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </DropdownMenuItem>
                  {patientInfo?.profilePicture?.includes(
                    "https://res.cloudinary.com"
                  ) && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        openModal("deleteProfilePhoto", {
                          refreshProfile: refreshPatientData,
                          isUser: false,
                          patientId: id,
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Photo
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patientInfo?.name}</h1>
              <p className="text-gray-600">{patientInfo?.preferredName}</p>
            </div>
          </div>

          <Tabs
            defaultValue="information"
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex flex-col sm:pl-14"
          >
            <TabsList className="flex items-center flex-wrap h-auto space-y-1 justify-start xl:justify-between">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="allergy">Allergy</TabsTrigger>
              <TabsTrigger value="vital">Vital</TabsTrigger>
              <TabsTrigger value="personal-preference">
                Personal Preference
              </TabsTrigger>
              <TabsTrigger value="problem-log">Problem Log</TabsTrigger>
              <TabsTrigger value="activity-preference">
                Activity Preference
              </TabsTrigger>
              <TabsTrigger value="routine">Routine</TabsTrigger>
              <TabsTrigger value="prescription">Prescription</TabsTrigger>
              <TabsTrigger value="photo-album">Photo Album</TabsTrigger>
              <TabsTrigger value="guardian">Guardian</TabsTrigger>
              <TabsTrigger value="activity-exclusion">
                Activity Exclusion
              </TabsTrigger>
            </TabsList>

            <Suspense fallback={<div>Loading...</div>}>
              {activeTab === "information" && (
                <TabsContent value="information">
                  <PatientInfoTab
                    id={id}
                    patientInfo={patientInfo}
                    nricData={nricData}
                    handleNRICToggle={handleNRICToggle}
                    refreshPatientData={refreshPatientData}
                  />
                </TabsContent>
              )}
              {activeTab === "allergy" && (
                <TabsContent value="allergy">
                  <AllergyTab id={id} />
                </TabsContent>
              )}
              {activeTab === "vital" && (
                <TabsContent value="vital">
                  <VitalTab id={id} />
                </TabsContent>
              )}
              {activeTab === "personal-preference" && (
                <TabsContent value="personal-preference">
                  <PersonalPreferenceTab id={id} />
                </TabsContent>
              )}
              {activeTab === "problem-log" && (
                <TabsContent value="problem-log">
                  <ProblemLogTab id={id} />
                </TabsContent>
              )}
              {activeTab === "activity-preference" && (
                <TabsContent value="activity-preference">
                  <ActivityPreferenceTab id={id} />
                </TabsContent>
              )}
              {activeTab === "routine" && (
                <TabsContent value="routine">
                  <RoutineTab id={id} />
                </TabsContent>
              )}
              {activeTab === "prescription" && (
                <TabsContent value="prescription">
                  <PrescriptionTab id={id} />
                </TabsContent>
              )}
              {activeTab === "photo-album" && (
                <TabsContent value="photo-album">
                  <PhotoAlbumTab id={id} />
                </TabsContent>
              )}
              {activeTab === "guardian" && (
                <TabsContent value="guardian">
                  <GuardianTab id={id} />
                </TabsContent>
              )}
              {activeTab === "activity-exclusion" && (
                <TabsContent value="activity-exclusion">
                  <ActivityExclusionTab id={id} />
                </TabsContent>
              )}
            </Suspense>
          </Tabs>
        </div>
      </div>
      {activeModal.name === "uploadProfilePhoto" && <UploadProfilePhotoModal />}
      {activeModal.name === "confirmProfilePhoto" && (
        <ConfirmProfilePhotoModal />
      )}
      {activeModal.name === "deleteProfilePhoto" && <DeleteProfilePhotoModal />}
    </>
  );
};

export default ViewPatient;
