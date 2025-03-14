import React, { Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import DeleteProfilePhotoModal from "@/components/Modal/Delete/DeleteProfilePhotoModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

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
  () => import("@/components/Tab/ProblemHistoryTab")
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
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab =
    new URLSearchParams(location.search).get("tab") || "information";

  const { id, patientInfo, refreshPatientData } = useViewPatient();
  const { activeModal, openModal } = useModal();

  const handleTabChange = (value: string) => {
    // Update the URL with the new tab
    navigate({
      pathname: location.pathname,
      search: `?tab=${value}`, // Set the selected tab in the URL query
    });
  };

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
              <TabsTrigger value="problem-history">Problem History</TabsTrigger>
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
              {activeTab === "information" && <PatientInfoTab />}
              {activeTab === "allergy" && <AllergyTab />}
              {activeTab === "vital" && <VitalTab />}
              {activeTab === "personal-preference" && <PersonalPreferenceTab />}
              {activeTab === "problem-history" && <ProblemLogTab />}
              {activeTab === "activity-preference" && <ActivityPreferenceTab />}
              {activeTab === "routine" && <RoutineTab />}
              {activeTab === "prescription" && <PrescriptionTab />}
              {activeTab === "photo-album" && <PhotoAlbumTab />}
              {activeTab === "guardian" && <GuardianTab />}
              {activeTab === "activity-exclusion" && <ActivityExclusionTab />}
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
