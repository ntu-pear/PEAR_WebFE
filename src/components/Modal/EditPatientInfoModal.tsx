import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useEffect, useRef, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import {
  fetchPatientById,
  PatientBase,
  updatePatient,
} from '@/api/patients/patients';
import {
  convertToUTCISOString,
  getDateForDatePicker,
  getDateTimeNowInUTC,
} from '@/utils/formatDate';
import {
  mockPreferredLanguageList,
  PreferredLanguage,
} from '@/mocks/mockPatientDetails';
import { fetchAddress, GeocodeBase } from '@/api/geocode';
import { toast } from 'sonner';

const EditPatientInfoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshPatientData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshPatientData: () => void;
  };
  const [isEditingPermanentAddr, setIsEditingPermanentAddr] = useState(false);
  const [isEditingTemporaryAddr, setIsEditingTemporaryAddr] = useState(false);
  const [newPermAddress, setNewPermAddress] = useState({
    postalCode: '',
    unitNumber: '',
    newAddress: '',
    error: '',
    loading: false,
    isValidPostal: false,
  });

  const [newTempAddress, setNewTempAddress] = useState({
    postalCode: '',
    unitNumber: '',
    newAddress: '',
    error: '',
    loading: false,
    isValidPostal: false,
  });

  const [patient, setPatient] = useState<PatientBase | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<
    PreferredLanguage[]
  >([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [currentTab, setCurrentTab] = useState('personal');

  const handleFetchPatientInfo = async (patientId: string) => {
    if (!patientId || isNaN(Number(patientId))) return;

    const response = await fetchPatientById(Number(patientId));
    setPatient({
      ...response,
      dateOfBirth: getDateForDatePicker(response.dateOfBirth),
      startDate: getDateForDatePicker(response.startDate),
      endDate: response.endDate ? getDateForDatePicker(response.endDate) : '',
      inActiveDate: response.inActiveDate
        ? getDateForDatePicker(response.inActiveDate)
        : '',
    });
  };

  const handleFetchPreferredLanguage = async () => {
    const response = mockPreferredLanguageList;
    setPreferredLanguage(response);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.toUpperCase();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const upperCaseValue = value.toUpperCase();
    if (patient) {
      if (name === 'isActive') {
        const isActive = value === '1';
        setPatient({
          ...patient,
          [name]: upperCaseValue,
          inActiveDate: isActive
            ? ''
            : getDateForDatePicker(getDateTimeNowInUTC()),
        });
      } else {
        setPatient({ ...patient, [name]: upperCaseValue });
      }
    }
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'perm' | 'temp'
  ) => {
    const { name, value } = e.target;
    const upperCaseValue = value.toUpperCase();
    const isValidPostal =
      name === 'postalCode' ? /^\d{6}$/.test(upperCaseValue) : true;

    if (type === 'perm') {
      setNewPermAddress({
        ...newPermAddress,
        [name]: upperCaseValue,
        isValidPostal,
      });
    } else {
      setNewTempAddress({
        ...newTempAddress,
        [name]: upperCaseValue,
        isValidPostal,
      });
    }
  };

  const handleRetrieve = async (type: 'perm' | 'temp') => {
    let setAddressState, addressState;

    if (type === 'perm') {
      setAddressState = setNewPermAddress;
      addressState = newPermAddress;
    } else {
      setAddressState = setNewTempAddress;
      addressState = newTempAddress;
    }

    setAddressState({ ...addressState, error: '', loading: true });
    console.log(addressState);

    try {
      const fetchedAddress: GeocodeBase = await fetchAddress(
        Number(addressState?.postalCode),
        encodeURIComponent(addressState.unitNumber)
      );
      setAddressState({
        ...addressState,
        newAddress: fetchedAddress.fullAddress,
        error: '',
        loading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error retrieving the address:', error);

      if (error?.status === 404) {
        console.log('Address not found for the provided postal code.');
        setAddressState({
          ...addressState,
          error: 'Address not found for the provided postal code.',
          loading: false,
        });
      } else {
        setAddressState({
          ...addressState,
          error: 'An unexpected error occurred.',
          loading: false,
        });
      }
    }
  };

  const handleClear = (type: 'perm' | 'temp') => {
    if (type === 'perm') {
      setNewPermAddress({
        postalCode: '',
        unitNumber: '',
        newAddress: '',
        error: '',
        loading: false,
        isValidPostal: false,
      });
    } else if (type === 'temp') {
      setNewTempAddress({
        postalCode: '',
        unitNumber: '',
        newAddress: '',
        error: '',
        loading: false,
        isValidPostal: false,
      });
    }
  };

  const handleEditInformation = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!patient) {
      console.error('patient is null');
      return;
    }

    const personalInfoValid = validatePersonalInfo();
    const addressValid = validateAddress();
    const additionalInfoValid = validateAdditionalInfo();

    if (!personalInfoValid) {
      setCurrentTab('personal');
      return;
    }

    if (!addressValid) {
      setCurrentTab('address');
      return;
    }

    if (!additionalInfoValid) {
      setCurrentTab('additional');
      return;
    }

    const updatedPermAddr =
      isEditingPermanentAddr && newPermAddress.newAddress
        ? newPermAddress.newAddress
        : patient?.address;
    const updatedTempAddr =
      isEditingTemporaryAddr && newTempAddress.newAddress
        ? newTempAddress.newAddress
        : patient?.tempAddress;

    const editedPatient: PatientBase = {
      ...patient,
      address: updatedPermAddr || '',
      tempAddress: updatedTempAddr || undefined,
      dateOfBirth: convertToUTCISOString(patient.dateOfBirth),
      startDate: convertToUTCISOString(patient.startDate),
      endDate: patient.endDate
        ? convertToUTCISOString(patient.endDate)
        : undefined,
      inActiveDate: patient.inActiveDate
        ? convertToUTCISOString(patient.inActiveDate)
        : undefined,
      modifiedDate: getDateTimeNowInUTC(),
      modifiedById: parseInt(submitterId as string, 10),
    };

    console.log('editedPatient', editedPatient);

    try {
      await updatePatient(Number(patientId), editedPatient);
      closeModal();
      toast.success('Patient Information updated successfully.');
      refreshPatientData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error('Failed to update patient information.');
    }

    closeModal();
  };

  const validatePersonalInfo = () => {
    if (!patient) return false;
    if (
      !patient.firstName ||
      !patient.preferredName ||
      !patient.nric ||
      !patient.dateOfBirth ||
      !patient.gender
    ) {
      return false;
    }
    if (!/^(S|T|F|G)\d{7}[A-Z]$/.test(patient.nric)) {
      return false;
    }
    return true;
  };

  const validateAddress = () => {
    if (!patient) return false;
    if (!patient.address) {
      return false;
    }
    if (isEditingPermanentAddr && !newPermAddress.newAddress) {
      return false;
    }
    if (isEditingTemporaryAddr && !newTempAddress.newAddress) {
      return false;
    }
    return true;
  };

  const validateAdditionalInfo = () => {
    if (!patient) return false;
    if (
      !patient.privacyLevel ||
      !patient.preferredLanguageId ||
      !patient.isRespiteCare ||
      !patient.isActive ||
      !patient.startDate
    ) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    handleFetchPatientInfo(patientId);
    handleFetchPreferredLanguage();
  }, []);

  useEffect(() => {
    console.log(`Tab changed to: ${currentTab}`);
    const timeoutId = setTimeout(() => {
      if (formRef.current) {
        formRef.current.reportValidity(); // Call reportValidity after 500ms
      }
    }, 500);

    return () => clearTimeout(timeoutId); // Cleanup timeout on tab change
  }, [currentTab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-background p-8 rounded-md w-[600px] max-h-screen overflow-y-auto"
      >
        <h3 className="text-lg font-medium mb-5">Edit Patient Information</h3>
        <form onSubmit={handleEditInformation} ref={formRef}>
          <Tabs
            value={currentTab}
            className="w-full"
            onValueChange={(value) => setCurrentTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>
            <TabsContent
              value="personal"
              className="grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
            >
              <div>
                <label className="block text-sm font-medium">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={patient?.firstName || ''}
                  onKeyDown={(e) => handleKeyDown(e)}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Preferred Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="preferredName"
                  value={patient?.preferredName || ''}
                  onKeyDown={(e) => handleKeyDown(e)}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  NRIC<span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  name="nric"
                  pattern="^(S|T|F|G)\d{7}[A-Z]$"
                  value={patient?.nric || ''}
                  minLength={9}
                  maxLength={9}
                  onKeyDown={(e) => handleKeyDown(e)}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Date of Birth<span className="text-red-600"> *</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={patient?.dateOfBirth || ''}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div className="col-span-2 grid grid-cols-2">
                <div className="col-span-1">
                  <label className="block text-sm font-medium">
                    Gender<span className="text-red-600"> *</span>
                  </label>
                  <select
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    name="gender"
                    value={patient?.gender || ''}
                    onChange={(e) => handleChange(e)}
                    required
                  >
                    <option value="">Please select an option</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="col-span-1"></div>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Hand Phone Number
                </label>
                <input
                  type="tel"
                  name="handphoneNo"
                  pattern="^[89]\d{7}$"
                  title="Hand Phone Number must start with 8 or 9, and be 8 digits long."
                  value={patient?.handphoneNo || ''}
                  min={8}
                  max={8}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Home Number</label>
                <input
                  type="tel"
                  name="homeNo"
                  pattern="^[6]\d{7}$"
                  title="Home Number must start with 6,  and be 8 digits long"
                  value={patient?.homeNo || ''}
                  min={8}
                  max={8}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                />
              </div>
            </TabsContent>

            {/* Permanent Address Section */}
            <TabsContent
              value="address"
              className="grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
            >
              <div className="col-span-2">
                <div className="p-4 rounded-lg border grid grid-cols-[1fr_auto] items-center">
                  <h3 className="font-medium mb-2">
                    Current Address<span className="text-red-600"> *</span>
                  </h3>
                  {!isEditingPermanentAddr && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPermanentAddr(true)}
                      className="justify-self-end h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <input
                    type="text"
                    value={patient?.address || ''}
                    className="mt-1 block w-full p-2 border rounded-md bg-gray-100 col-span-2"
                    readOnly
                    required
                  />
                </div>
              </div>
              {isEditingPermanentAddr && (
                <div className="col-span-2">
                  <div className="p-4 rounded-lg border grid grid-cols-[1fr_auto] items-center">
                    <h3 className="font-medium mb-2">New Address</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleClear('perm');
                        setIsEditingPermanentAddr(false);
                      }}
                      className="justify-self-end h-8 w-8 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <div className="grid grid-cols-8 gap-x-4 sm:gap-y-4 mb-2">
                      <div className="space-y-2 col-span-2">
                        <label className="block text-sm font-medium">
                          Postal Code<span className="text-red-600"> *</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          pattern="^\d{6}$"
                          minLength={6}
                          maxLength={6}
                          value={newPermAddress.postalCode || ''}
                          onChange={(e) => handleAddressChange(e, 'perm')}
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-3">
                        <label className="col-span-3 block text-sm font-medium">
                          Unit Number
                        </label>
                        <input
                          type="text"
                          name="unitNumber"
                          placeholder="#01-123"
                          pattern="^$|#\d{2}-\d{3}"
                          value={newPermAddress.unitNumber || ''}
                          onChange={(e) => handleAddressChange(e, 'perm')}
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>
                      <div className="space-y-2 col-span-4 sm:col-span-3">
                        <Button
                          type="button"
                          className="mt-7 col-span-2 mr-2"
                          onClick={() => handleRetrieve('perm')}
                          disabled={!newPermAddress.isValidPostal}
                        >
                          Retrieve
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          className="mt-7 col-span-1"
                          onClick={() => handleClear('perm')}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {newPermAddress.error && (
                        <div className="text-red-600 mb-2">
                          {newPermAddress.error}
                        </div>
                      )}
                      <label className="block text-sm font-medium">
                        Address<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="newAddress"
                        value={newPermAddress.newAddress || ''}
                        onKeyDown={(e) => handleKeyDown(e)}
                        onChange={(e) => handleAddressChange(e, 'perm')}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <div className="p-4 rounded-lg border grid grid-cols-[1fr_auto] items-center">
                  <h3 className="font-medium mb-2">
                    Current Temporary Address
                  </h3>
                  {!isEditingTemporaryAddr && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTemporaryAddr(true)}
                      className="justify-self-end h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <input
                    type="text"
                    value={patient?.tempAddress || ''}
                    onChange={(e) => handleChange(e)}
                    className="mt-1 block w-full p-2 border rounded-md bg-gray-100 col-span-2"
                    readOnly
                    required
                  />
                </div>
              </div>
              {isEditingTemporaryAddr && (
                <div className="col-span-2">
                  <div className="p-4 rounded-lg border grid grid-cols-[1fr_auto] items-center">
                    <h3 className="font-medium mb-2">New Temporary Address</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTemporaryAddr(false)}
                      className="justify-self-end h-8 w-8 p-0"
                    >
                      <X
                        className="h-5 w-5"
                        onClick={() => {
                          handleClear('temp');
                          setIsEditingTemporaryAddr(false);
                        }}
                      />
                    </Button>
                    <div className="grid grid-cols-8 gap-x-4 sm:gap-y-4 mb-2">
                      <div className="space-y-2 col-span-2">
                        <label className="block text-sm font-medium">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          pattern="^\d{6}$"
                          minLength={6}
                          maxLength={6}
                          value={newTempAddress.postalCode || ''}
                          onChange={(e) => handleAddressChange(e, 'temp')}
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>
                      <div className="space-y-2 col-span-3">
                        <label className="col-span-3 block text-sm font-medium">
                          Unit Number
                        </label>
                        <input
                          type="text"
                          name="unitNumber"
                          placeholder="#01-123"
                          pattern="^$|#\d{2}-\d{3}"
                          value={newTempAddress.unitNumber || ''}
                          onChange={(e) => handleAddressChange(e, 'temp')}
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>
                      <div className="space-y-2 col-span-4 sm:col-span-3">
                        <Button
                          type="button"
                          className="mt-7 col-span-2 mr-2"
                          onClick={() => handleRetrieve('temp')}
                          disabled={!newTempAddress.isValidPostal}
                        >
                          Retrieve
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          className="mt-7 col-span-1"
                          onClick={() => handleClear('temp')}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-2 mt-4">
                      {newTempAddress.error && (
                        <div className="text-red-600 mb-2">
                          {newTempAddress.error}
                        </div>
                      )}
                      <label className="block text-sm font-medium">
                        Temporary Address
                      </label>
                      <input
                        type="text"
                        name="newAddress"
                        value={newTempAddress.newAddress || ''}
                        onKeyDown={(e) => handleKeyDown(e)}
                        onChange={(e) => handleAddressChange(e, 'temp')}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="additional"
              className="grid grid-cols-2 gap-4 data-[state=inactive]:hidden"
            >
              {/* <div className="col-span-2">
                <label className="block text-sm font-medium">
                  Upload Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium">
                  Privacy Level <span className="text-red-600">*</span>
                </label>
                <select
                  name="privacyLevel"
                  value={patient?.privacyLevel || ''}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                >
                  <option value="">Please select an option</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Patient Preferred Language{' '}
                  <span className="text-red-600">*</span>
                </label>
                <select
                  name="preferredLanguageId"
                  value={patient?.preferredLanguageId || ''}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                >
                  <option value="">Please select an option</option>
                  {preferredLanguage?.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Under Respite Care <span className="text-red-600">*</span>
                </label>
                <select
                  name="isRespiteCare"
                  value={patient?.isRespiteCare || ''}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                >
                  <option value="">Please select an option</option>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Patient Still Active <span className="text-red-600">*</span>
                </label>
                <select
                  name="isActive"
                  value={patient?.isActive || ''}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                >
                  <option value="">Please select an option</option>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div className="col-span-2 flex space-x-4">
                <div className="w-full">
                  <label className="block text-sm font-medium">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={patient?.startDate || ''}
                    onChange={(e) => handleChange(e)}
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={patient?.endDate || ''}
                    onChange={(e) => handleChange(e)}
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    min={
                      patient?.inActiveDate && patient.inActiveDate
                        ? patient.inActiveDate
                        : patient?.startDate || ''
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientInfoModal;
