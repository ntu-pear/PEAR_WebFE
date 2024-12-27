// import { fetchPatientById, PatientBase } from "@/api/patients";
import React, { useEffect, useRef, useState } from 'react';
import { /* useParams,*/ useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { mockPatientProfilePic } from '@/mocks/mockPatientDetails';
import AddAllergyModal from '@/components/Modal/AddAllergyModal';
import AddDislikeModal from '@/components/Modal/AddDislikeModal';
import AddGuardianModal from '@/components/Modal/AddGuardianModal';
import AddHabitModal from '@/components/Modal/AddHabitModal';
import AddHobbyModal from '@/components/Modal/AddHobbyModal';
import AddLikeModal from '@/components/Modal/AddLikeModal';
import AddMedicalHistoryModal from '@/components/Modal/AddMedicalHistoryModal';
import AddMobilityAidModal from '@/components/Modal/AddMobilityAidModal';
import AddPrescriptionModal from '@/components/Modal/AddPrescriptionModal';
import AddProblemModal from '@/components/Modal/AddProblemModal';
import AddVitalModal from '@/components/Modal/AddVitalModal';
import EditPatientInfoModal from '@/components/Modal/EditPatientInfoModal';
import EditSocialHistoryModal from '@/components/Modal/EditSocialHistoryModal';
import EditStaffAllocationModal from '@/components/Modal/EditStaffAllocationModal';
import ActivityExclusionTab from '@/components/Tab/ActivityExclusionTab';
import AllergyTab from '@/components/Tab/AllergyTab';
import GuardianTab from '@/components/Tab/GuardianTab';
import PatientInfoTab from '@/components/Tab/PatientInfoTab';
import PersonalPreferenceTab from '@/components/Tab/PersonalPreferenceTab';
import PrescriptionTab from '@/components/Tab/PrescriptionTab';
import ProblemLogTab from '@/components/Tab/ProblemLogTab';
import RoutineTab from '@/components/Tab/RoutineTab';
import VitalTab from '@/components/Tab/VitalTab';
import PhotoAlbumTab from '@/components/Tab/PhotoAlbumTab';
import ActivityPreferenceTab from '@/components/Tab/ActivityPreferenceTab';
import AddRoutineModal from '@/components/Modal/AddRoutineModal';
import AddActivityPreferenceModal from '@/components/Modal/AddActivityPreferenceModal';
import AddActivityExclusionModal from '@/components/Modal/AddActivityExclusionModal';

const ViewPatient: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab =
    new URLSearchParams(location.search).get('tab') || 'information';
  // const [patient, setPatient] = useState<PatientBase | null>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  // Modal ref to detect outside clicks
  const modalRef = useRef<HTMLDivElement | null>(null);
  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const handleFetchPatient = async () => {
    // if (!id || isNaN(Number(id))) return;
    // try {
    //   const fetchedPatient: PatientBase = await fetchPatientById(Number(id));
    //   console.log(fetchedPatient);
    //   setPatient(fetchedPatient);
    // } catch (error) {
    //   console.error("Error fetching patient:", error);
    // }
  };

  const handleTabChange = (value: string) => {
    // Update the URL with the new tab
    navigate({
      pathname: location.pathname,
      search: `?tab=${value}`, // Set the selected tab in the URL query
    });
  };

  // Close the modal if clicking outside the modal content
  useEffect(() => {
    handleFetchPatient();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeModal]);

  useEffect(() => {
    handleFetchPatient();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-6 mb-8 sm:pl-14">
          <Avatar className="h-36 w-36">
            <AvatarImage src={mockPatientProfilePic} alt="Bob Smith" />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Bob Smith</h1>
            <p className="text-gray-600">Bob</p>
          </div>
        </div>

        <Tabs
          defaultValue="information"
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex flex-col sm:pl-14"
        >
          <TabsList className="flex justify-between">
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

          <PatientInfoTab openModal={openModal} />

          <AllergyTab openModal={openModal} />

          <VitalTab openModal={openModal} />

          <PersonalPreferenceTab openModal={openModal} />

          <ProblemLogTab openModal={openModal} />

          <ActivityPreferenceTab openModal={openModal} />

          <RoutineTab openModal={openModal} />

          <PrescriptionTab openModal={openModal} />

          <PhotoAlbumTab openModal={openModal} />

          <GuardianTab openModal={openModal} />

          <ActivityExclusionTab openModal={openModal} />
        </Tabs>
      </div>

      {activeModal === 'editPatientInfo' && (
        <EditPatientInfoModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addMedicalHistory' && (
        <AddMedicalHistoryModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addMobilityAids' && (
        <AddMobilityAidModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'editStaffAllocation' && (
        <EditStaffAllocationModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'editSocialHistory' && (
        <EditSocialHistoryModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addAllergy' && (
        <AddAllergyModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addVital' && (
        <AddVitalModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addLike' && (
        <AddLikeModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addDislike' && (
        <AddDislikeModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addHobby' && (
        <AddHobbyModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addHabit' && (
        <AddHabitModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addProblem' && (
        <AddProblemModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal == 'addActivityPreference' && (
        <AddActivityPreferenceModal
          modalRef={modalRef}
          closeModal={closeModal}
        />
      )}

      {activeModal == 'addRoutine' && (
        <AddRoutineModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addPrescription' && (
        <AddPrescriptionModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal === 'addGuardian' && (
        <AddGuardianModal modalRef={modalRef} closeModal={closeModal} />
      )}

      {activeModal == 'addActivityExclusion' && (
        <AddActivityExclusionModal
          modalRef={modalRef}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default ViewPatient;
