import { fetchProfilePhotoAndName } from '@/api/patients/patients';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  mockProfilePhotoAndName,
  ProfilePhotoAndName,
} from '@/mocks/mockPatientDetails';

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

const ViewPatient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab =
    new URLSearchParams(location.search).get('tab') || 'information';
  const [profilePhotoAndName, setProfilePhotoAndName] =
    useState<ProfilePhotoAndName | null>(null);

  const handleFetchPhotoAndName = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedData: ProfilePhotoAndName =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? await fetchProfilePhotoAndName(Number(id))
          : mockProfilePhotoAndName;
      // console.log(fetchedData);
      setProfilePhotoAndName(fetchedData);
    } catch (error) {
      console.error('Error fetching patient:', error);
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
    handleFetchPhotoAndName();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-6 mb-8 sm:pl-14">
          <Avatar className="h-36 w-36">
            <AvatarImage
              src={profilePhotoAndName?.profilePicture}
              alt={profilePhotoAndName?.name}
            />
            <AvatarFallback>
              <p className="text-5xl">
                {profilePhotoAndName?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </p>
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profilePhotoAndName?.name}</h1>
            <p className="text-gray-600">
              {profilePhotoAndName?.preferredName}
            </p>
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

          <PatientInfoTab id={id} />
          <AllergyTab id={id} />
          <VitalTab id={id} />
          <PersonalPreferenceTab id={id} />
          <ProblemLogTab id={id} />
          <ActivityPreferenceTab id={id} />
          <RoutineTab id={id} />
          <PrescriptionTab id={id} />
          <PhotoAlbumTab id={id} />
          <GuardianTab id={id} />
          <ActivityExclusionTab id={id} />
        </Tabs>
      </div>
    </div>
  );
};

export default ViewPatient;
