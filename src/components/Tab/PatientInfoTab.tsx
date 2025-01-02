import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon, FilePenLine, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import {
  mockDiagnosedDementiaList,
  mockDoctorNotes,
  mockMaskedNRIC,
  mockMediclaDetails,
  mockMobilityAids,
  mockPatientInformation,
  mockSocialHistory,
  mockStaffAllocation,
  mockUnmaskedNRIC,
  PatientInformation,
  SocialHistory,
} from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { fetchPatientInfo } from '@/api/patients/patients';
import { useModal } from '@/hooks/useModal';
import EditPatientInfoModal from '../Modal/EditPatientInfoModal';
import AddMedicalHistoryModal from '../Modal/AddMedicalHistoryModal';
import AddMobilityAidModal from '../Modal/AddMobilityAidModal';
import EditStaffAllocationModal from '../Modal/EditStaffAllocationModal';
import EditSocialHistoryModal from '../Modal/EditSocialHistoryModal';

const PatientInfoTab: React.FC<TabProps> = ({ id }) => {
  const [isNRICMasked, setisNRICMasked] = useState(true);
  const [patientInfo, setPatientInfo] = useState<PatientInformation | null>(
    null
  );
  const [nric, setNric] = useState('');
  const [socialHistory, setSocialHistory] = useState<SocialHistory | null>(
    null
  );
  const { activeModal, openModal } = useModal();

  const handleNRICToggle = () => {
    const updatedNric = isNRICMasked ? mockUnmaskedNRIC : mockMaskedNRIC;
    setNric(updatedNric);
    setisNRICMasked(!isNRICMasked);
  };

  const handleFetchPatientInfo = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedPatientInfo: PatientInformation =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? await fetchPatientInfo(Number(id))
          : mockPatientInformation;

      // console.log('Fetched Patient Info:', fetchedPatientInfo); // Debug Log
      setPatientInfo(fetchedPatientInfo);
    } catch (error) {
      console.error('Error fetching patient information:', error);
    }
  };

  const handleFetchSocialHistory = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedSocialHistory: SocialHistory =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? mockSocialHistory
          : mockSocialHistory;

      // console.log('Fetched Patient Social History', fetchedSocialHistory); // Debug Log
      setSocialHistory(fetchedSocialHistory);
    } catch (error) {
      console.error('Error fetching patient information:', error);
    }
  };

  useEffect(() => {
    console.log(id);
    handleFetchPatientInfo();
    handleFetchSocialHistory();
  }, []);

  const patientInformationColumns = [
    { key: 'name', header: 'Name' },
    { key: 'nric', header: 'NRIC' },
    { key: 'dateOfBirth', header: 'Date Of Birth' },
    { key: 'gender', header: 'Gender' },
    { key: 'address', header: 'Address' },
    { key: 'inactiveDate', header: 'Inactive Date' },
    { key: 'temporaryAddress', header: 'Temporary Address' },
    { key: 'homeNo', header: 'Home No' },
    { key: 'handphoneNo', header: 'Handphone No' },
    { key: 'preferredName', header: 'Preferred Name' },
    { key: 'perferredLanguage', header: 'Preferred Language' },
    { key: 'underRespiteCare', header: 'Under Respite Care' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
  ];

  const dementiaColumns = [
    { key: 'dementiaType', header: 'Dementia Type' },
    { key: 'dementiaDate', header: 'Dementia Date' },
  ];

  const mediclaDetailsColumns = [
    { key: 'medicalDetails', header: 'Medical Details' },
    { key: 'informationSource', header: 'Information Source' },
    { key: 'medicalEstimatedDate', header: 'Medical Estimated Date' },
    { key: 'notes', header: 'Notes' },
  ];

  const mobilityAidsColumns = [
    { key: 'mobilityAids', header: 'Mobility Aids' },
    { key: 'remark', header: 'Remark' },
    { key: 'condition', header: 'Condition' },
    { key: 'date', header: 'Date' },
  ];

  const doctorNotesColumns = [
    { key: 'date', header: 'Date' },
    { key: 'doctorName', header: "Doctor's Name" },
    { key: 'notes', header: 'Notes' },
  ];

  const staffAllocationColumns = [
    { key: 'staffRole', header: 'Staff Role' },
    { key: 'staffName', header: 'Staff Name' },
  ];

  const socialHistoryColumns = [
    { key: 'caffeineUse', header: 'Caffeine Use' },
    { key: 'diet', header: 'Diet' },
    { key: 'drugUse', header: 'Drug Use' },
    { key: 'education', header: 'Education' },
    { key: 'exercise', header: 'Exercise' },
    { key: 'liveWith', header: 'Live With' },
    { key: 'occupation', header: 'Occupation' },
    { key: 'pet', header: 'Pet' },
    { key: 'religion', header: 'Religion' },
    { key: 'secondhandSmoker', header: 'Secondhand Smoker' },
    { key: 'sexuallyActive', header: 'Sexually Active' },
    { key: 'tobaccoUse', header: 'Tobacco Use' },
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
                  onClick={() => openModal('editPatientInfo')}
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
                        {column.key === 'nric'
                          ? !isNRICMasked
                            ? nric || '-'
                            : nric ||
                              patientInfo?.[
                                column.key as keyof PatientInformation
                              ] ||
                              '-'
                          : patientInfo?.[
                              column.key as keyof PatientInformation
                            ] || '-'}
                        {column.key === 'nric' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleNRICToggle}
                            className="h-6 w-6 flex items-center justify-center ml-1"
                          >
                            {isNRICMasked ? (
                              <EyeIcon className="h-5 w-5" /> // Masked
                            ) : (
                              <EyeOffIcon className="h-5 w-5" /> // Unmasked
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
                        {column.key === 'nric'
                          ? !isNRICMasked
                            ? nric || '-'
                            : nric ||
                              patientInfo?.[
                                column.key as keyof PatientInformation
                              ] ||
                              '-'
                          : patientInfo?.[
                              column.key as keyof PatientInformation
                            ] || '-'}
                        {column.key === 'nric' && (
                          <Button
                            size="icon"
                            variant="link"
                            onClick={handleNRICToggle}
                            className="h-6 w-6 flex items-center justify-center ml-1"
                          >
                            {isNRICMasked ? (
                              <EyeIcon className="h-5 w-5" /> // Masked
                            ) : (
                              <EyeOffIcon className="h-5 w-5" /> // Unmasked
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
              <DataTable
                data={mockDiagnosedDementiaList}
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
                onClick={() => openModal('addMedicalHistory')}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
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
                onClick={() => openModal('addMobilityAids')}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockMobilityAids}
              columns={mobilityAidsColumns}
              viewMore={false}
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
            <DataTable
              data={mockDoctorNotes}
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
                  onClick={() => openModal('editStaffAllocation')}
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
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
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() => openModal('editSocialHistory')}
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                  </span>
                </Button>
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
                        {socialHistory?.[column.key as keyof SocialHistory] ||
                          '-'}
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
                        {socialHistory?.[column.key as keyof SocialHistory] ||
                          '-'}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      {activeModal.name === 'editPatientInfo' && <EditPatientInfoModal />}

      {activeModal.name === 'addMedicalHistory' && <AddMedicalHistoryModal />}

      {activeModal.name === 'addMobilityAids' && <AddMobilityAidModal />}

      {activeModal.name === 'editStaffAllocation' && (
        <EditStaffAllocationModal />
      )}

      {activeModal.name === 'editSocialHistory' && <EditSocialHistoryModal />}
    </>
  );
};

export default PatientInfoTab;
