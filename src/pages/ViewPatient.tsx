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
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import UploadProfilePhotoModal from "@/components/Modal/UploadProfilePhotoModal";
import ConfirmProfilePhotoModal from "@/components/Modal/ConfirmProfilePhotoModal";
import DeleteProfilePhotoModal from "@/components/Modal/Delete/DeleteProfilePhotoModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";

const AllergyTab = React.lazy(() => import("@/components/Tab/AllergyTab"));
const GuardianTab = React.lazy(() => import("@/components/Tab/GuardianTab"));
const PatientInfoTab = React.lazy(
  () => import("@/components/Tab/PatientInfoTab")
);
const DiagnosedDementiaTab = React.lazy(
  () => import("@/components/Tab/DiagnosedDementiaTab")
);
const MedicalHistoryTab = React.lazy(
  () => import("@/components/Tab/MedicalHistoryTab")
);
const MobilityAidsTab = React.lazy(
  () => import("@/components/Tab/MobilityAidsTab")
);
const DoctorNotesTab = React.lazy(
  () => import("@/components/Tab/DoctorNotesTab")
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
const ActivityRecTab = React.lazy(
  () => import("@/components/Tab/ActivityRecTab")
);
const GameRecTab = React.lazy(() => import("@/components/Tab/GameRecTab"));

const ViewPatient: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab =
    new URLSearchParams(location.search).get("tab") || "information";

  const { currentUser } = useAuth();
  const { id, patientInfo, refreshPatientData, patientAllocation } = useViewPatient();
  const { activeModal, openModal } = useModal();

  const isSupervisor = currentUser?.roleName === "SUPERVISOR";
  const isDoctor = currentUser?.roleName === "DOCTOR";
  const isGuardian = currentUser?.roleName === "GUARDIAN";

  const managePatientsPath = (() => {
    switch (currentUser?.roleName) {
      case "SUPERVISOR":
        return "/supervisor/manage-patients";
      case "DOCTOR":
        return "/doctor/manage-patients";
      case "GUARDIAN":
        return "/guardian/manage-patients";
      default:
        return null;
    }
  })();

  const handleTabChange = (value: string) => {
    navigate({
      pathname: location.pathname,
      search: `?tab=${value}`,
    });
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
        <div className="container mx-auto p-4">
          <div className="mb-8 flex items-start justify-between gap-4 sm:pl-14">
            <div className="flex items-center space-x-6">
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
                {(isSupervisor || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
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
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patientInfo?.name}</h1>
                <p className="text-gray-600">{patientInfo?.preferredName}</p>
              </div>
            </div>
            {managePatientsPath && (
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => navigate(managePatientsPath)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Manage Patients
              </Button>
            )}
          </div>

          <Tabs
            defaultValue="information"
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex flex-col sm:pl-14"
          >
            <TabsList className="flex items-center flex-wrap h-auto justify-start 2xl:gap-x-3">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="diagnosed-dementia">Diagnosed Dementia</TabsTrigger>
              <TabsTrigger value="medical-history">Medical History</TabsTrigger>
              <TabsTrigger value="mobility-aids">Mobility Aids</TabsTrigger>
              {!isGuardian && (
                <TabsTrigger value="doctor-notes">Doctor Notes</TabsTrigger>
              )}
              <TabsTrigger value="vital">Vital Signs</TabsTrigger>
              <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
              <TabsTrigger value="problem-log">Problem Log</TabsTrigger>
              <TabsTrigger value="personal-preference">Personal Preferences</TabsTrigger>
              <TabsTrigger value="allergy">Allergies</TabsTrigger>
              {(isSupervisor || isGuardian) && (
                <TabsTrigger value="routine">Routine</TabsTrigger>
              )}
              {isSupervisor && (
                <TabsTrigger value="activity-preference">Activity Preference</TabsTrigger>
              )}
              {isSupervisor && (
                <TabsTrigger value="activity-exclusion">Activity Exclusion</TabsTrigger>
              )}
              {isDoctor && (
                <TabsTrigger value="game-recommendation">Game Recommendations</TabsTrigger>
              )}
              {isDoctor && (
                <TabsTrigger value="center-activity-recommendation">
                  Centre Activity Recommendations
                </TabsTrigger>
              )}
              {(isSupervisor || isGuardian) && (
                <TabsTrigger value="guardian">Guardian</TabsTrigger>
              )}
              <TabsTrigger value="photo-album">Photo Album</TabsTrigger>
            </TabsList>

            <Suspense fallback={<div>Loading...</div>}>
              {activeTab === "information" && <PatientInfoTab />}
              {activeTab === "diagnosed-dementia" && <DiagnosedDementiaTab />}
              {activeTab === "medical-history" && <MedicalHistoryTab />}
              {activeTab === "mobility-aids" && <MobilityAidsTab />}
              {!isGuardian && activeTab === "doctor-notes" && <DoctorNotesTab />}
              {activeTab === "vital" && <VitalTab />}
              {activeTab === "prescription" && <PrescriptionTab />}
              {activeTab === "problem-log" && <ProblemLogTab />}
              {activeTab === "personal-preference" && <PersonalPreferenceTab />}
              {activeTab === "allergy" && <AllergyTab />}
              {isSupervisor && activeTab === "activity-preference" && <ActivityPreferenceTab />}
              {isSupervisor && activeTab === "activity-exclusion" && <ActivityExclusionTab />}
              {(isSupervisor || isGuardian) && activeTab === "routine" && <RoutineTab />}
              {isDoctor && activeTab === "game-recommendation" && <GameRecTab />}
              {isDoctor && activeTab === "center-activity-recommendation" && <ActivityRecTab />}
              {(isSupervisor || isGuardian) && activeTab === "guardian" && <GuardianTab />}
              {activeTab === "photo-album" && <PhotoAlbumTab />}
            </Suspense>
          </Tabs>
        </div>
      </div>

      {(isSupervisor || patientAllocation?.guardianApplicationUserId === currentUser?.userId) &&
        activeModal.name === "uploadProfilePhoto" && (
          <UploadProfilePhotoModal />
        )}
      {(isSupervisor || patientAllocation?.guardianApplicationUserId === currentUser?.userId) &&
        activeModal.name === "confirmProfilePhoto" && (
          <ConfirmProfilePhotoModal />
        )}
      {(isSupervisor || patientAllocation?.guardianApplicationUserId === currentUser?.userId) &&
        activeModal.name === "deleteProfilePhoto" && (
          <DeleteProfilePhotoModal />
        )}
    </>
  );
};

export default ViewPatient;
