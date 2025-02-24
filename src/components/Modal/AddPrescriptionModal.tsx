import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';
import { getDateTimeNowInUTC } from '@/utils/formatDate';
import { toast } from 'sonner';
import {
  addPatientPrescription,
  PrescriptionFormData,
  PrescriptionList,
} from '@/api/patients/prescription';
import { useEffect, useState } from 'react';
import { mockPrescriptionList } from '@/mocks/mockPatientDetails';

const AddPrescriptionModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshPrescriptionData } =
    activeModal.props as {
      patientId: string;
      submitterId: string;
      refreshPrescriptionData: () => void;
    };
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionList[]>(
    []
  );
  const [startDate, setStartDate] = useState('');
  const handleFetchPrescriptionList = async () => {
    try {
      const fetchedPrescriptionList: PrescriptionList[] = mockPrescriptionList;

      setPrescriptionList(fetchedPrescriptionList);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch Prescription List');
    }
  };

  const handleAddPrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());
    const startDate = formDataObj.StartDate as string;
    const endDate = formDataObj.EndDate as string;

    const prescriptionFormData: PrescriptionFormData = {
      PatientId: parseInt(patientId as string, 10),
      PrescriptionListId: parseInt(
        formDataObj.PrescriptionListId as string,
        10
      ),
      Dosage: formDataObj.Dosage as string,
      FrequencyPerDay: parseInt(formDataObj.FrequencyPerDay as string, 10),
      Instruction: formDataObj.Instruction as string,
      StartDate: startDate,
      EndDate: endDate,
      IsAfterMeal: formDataObj.IsAfterMeal as string,
      PrescriptionRemarks: formDataObj.PrescriptionRemarks as string,
      Status: formDataObj.Status as string,
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
      CreatedDateTime: getDateTimeNowInUTC() as string,
      UpdatedDateTime: getDateTimeNowInUTC() as string,
    };

    console.log(prescriptionFormData);

    try {
      await addPatientPrescription(prescriptionFormData);
      closeModal();
      toast.success('Patient prescription added successfully.');
      refreshPrescriptionData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add patient prescription. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          'Failed to add patient prescription. An unknown error occurred.'
        );
      }
    }
  };

  useEffect(() => {
    handleFetchPrescriptionList();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Medical Prescription</h3>
        <form
          onSubmit={handleAddPrescription}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">
              Prescription<span className="text-red-600">*</span>
            </label>
            <select
              name="PrescriptionListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              {prescriptionList.map((pl) => (
                <option key={pl.Id} value={pl.Id}>
                  {pl.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              To be taken<span className="text-red-600">*</span>
            </label>
            <select
              name="IsAfterMeal"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="0">Before Meal</option>
              <option value="1">After Meal</option>
              <option value="2">Doesn't Matter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Dosage<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="Dosage"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Frequency per day<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="FrequencyPerDay"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              min="0"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium">
              Status<span className="text-red-600">*</span>
            </label>
            <select
              name="Status"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="0">NON-CHRONIC</option>
              <option value="1">CHRONIC</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Instruction<span className="text-red-600">*</span>
            </label>
            <textarea
              name="Instruction"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              maxLength={255}
              required
            />
          </div>

          <div className="col-span-2 flex space-x-4">
            <div className="w-full">
              <label className="block text-sm font-medium">
                Start Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="StartDate"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium">
                End Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="EndDate"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                min={startDate}
                required
              />
            </div>
          </div>

          <div className="col-span-2 ">
            <label className="block text-sm font-medium">
              Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              name="PrescriptionRemarks"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              maxLength={255}
              required
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

export default AddPrescriptionModal;
