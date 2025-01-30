import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import {
  addPatientAllergy,
  AllergyAddFormData,
  AllergyReactionType,
  AllergyType,
  fetchAllAllergyReactionTypes,
  fetchAllAllergyTypes,
} from '@/api/patients/allergy';
import { toast } from 'sonner';

const AddAllergyModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshAllergyData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshAllergyData: () => void;
  };

  const [allergyTypes, setAllergyTypes] = useState<AllergyType[]>([]);
  const [allergyReactionTypes, setAllergyReactionTypes] = useState<
    AllergyReactionType[]
  >([]);

  const handleFetchAllergyType = async () => {
    try {
      const fetchedAllergyTypes: AllergyType[] = await fetchAllAllergyTypes();
      setAllergyTypes(fetchedAllergyTypes);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch Allergy Types List');
    }
  };

  const handleFetchAllergyReactionType = async () => {
    try {
      const fetchedAllergyReactionTypes: AllergyReactionType[] =
        await fetchAllAllergyReactionTypes();
      setAllergyReactionTypes(fetchedAllergyReactionTypes);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch Allergy Reaction Types List');
    }
  };

  const handleAddAllergy = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const allergyFormData: AllergyAddFormData = {
      AllergyRemarks: formDataObj.AllergyRemarks as string,
      IsDeleted: '0',
      PatientID: parseInt(patientId as string, 10),
      AllergyTypeID: parseInt(formDataObj.AllergyTypeID as string, 10),
      AllergyReactionTypeID: parseInt(
        formDataObj.AllergyReactionTypeID as string,
        10
      ),
      createdById: parseInt(submitterId as string, 10),
      modifiedById: parseInt(submitterId as string, 10),
    };

    try {
      await addPatientAllergy(allergyFormData);
      closeModal();
      toast.success('Patient allergy added successfully.');
      refreshAllergyData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add patient allergy. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          'Failed to add patient allergy. An unknown error occurred.'
        );
      }
    }
  };

  useEffect(() => {
    handleFetchAllergyType();
    handleFetchAllergyReactionType();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Allergy</h3>
        <form onSubmit={handleAddAllergy} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Allergy<span className="text-red-600">*</span>
            </label>
            <select
              name="AllergyTypeID"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              {allergyTypes.map((at) => (
                <option key={at.AllergyTypeID} value={at.AllergyTypeID}>
                  {at.Value}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Allergy Reaction<span className="text-red-600">*</span>
            </label>
            <select
              name="AllergyReactionTypeID"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              {allergyReactionTypes.map((art) => (
                <option
                  key={art.AllergyReactionTypeID}
                  value={art.AllergyReactionTypeID}
                >
                  {art.Value}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Notes<span className="text-red-600">*</span>
            </label>
            <textarea
              name="AllergyRemarks"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAllergyModal;
