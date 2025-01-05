import { fetchProfilePhotoAndName } from '@/api/patients/patients';
import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  mockProfilePhotoAndName,
  ProfilePhotoAndName,
} from '@/mocks/mockPatientDetails';

const AllergyTab = React.lazy(() => import('@/components/Tab/AllergyTab'));
const GuardianTab = React.lazy(() => import('@/components/Tab/GuardianTab'));
const PatientInfoTab = React.lazy(
  () => import('@/components/Tab/PatientInfoTab')
);
const VitalTab = React.lazy(() => import('@/components/Tab/VitalTab'));
const PersonalPreferenceTab = React.lazy(
  () => import('@/components/Tab/PersonalPreferenceTab')
);
const PrescriptionTab = React.lazy(
  () => import('@/components/Tab/PrescriptionTab')
);
const ProblemLogTab = React.lazy(
  () => import('@/components/Tab/ProblemLogTab')
);
const RoutineTab = React.lazy(() => import('@/components/Tab/RoutineTab'));
const PhotoAlbumTab = React.lazy(
  () => import('@/components/Tab/PhotoAlbumTab')
);
const ActivityPreferenceTab = React.lazy(
  () => import('@/components/Tab/ActivityPreferenceTab')
);
const ActivityExclusionTab = React.lazy(
  () => import('@/components/Tab/ActivityExclusionTab')
);

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

          <Suspense fallback={<div>Loading...</div>}>
            {activeTab === 'information' && (
              <TabsContent value="information">
                <PatientInfoTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'allergy' && (
              <TabsContent value="allergy">
                <AllergyTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'vital' && (
              <TabsContent value="vital">
                <VitalTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'personal-preference' && (
              <TabsContent value="personal-preference">
                <PersonalPreferenceTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'problem-log' && (
              <TabsContent value="problem-log">
                <ProblemLogTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'activity-preference' && (
              <TabsContent value="activity-preference">
                <ActivityPreferenceTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'routine' && (
              <TabsContent value="routine">
                <RoutineTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'prescription' && (
              <TabsContent value="prescription">
                <PrescriptionTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'photo-album' && (
              <TabsContent value="photo-album">
                <PhotoAlbumTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'guardian' && (
              <TabsContent value="guardian">
                <GuardianTab id={id} />
              </TabsContent>
            )}
            {activeTab === 'activity-exclusion' && (
              <TabsContent value="activity-exclusion">
                <ActivityExclusionTab id={id} />
              </TabsContent>
            )}
          </Suspense>
        </Tabs>
      </div>
    </div>
  );
};

export default ViewPatient;
