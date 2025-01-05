import { addVital, VitalFormData } from '@/api/patients/vital';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useModal } from '@/hooks/useModal';

const AddVitalModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshVitalData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshVitalData: () => void;
  };

  const handleAddVital = async (event: React.FormEvent) => {
    event.preventDefault();
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const vitalFormData: VitalFormData = {
      patientId: parseInt(patientId as string, 10),
      temperature: parseFloat(formDataObj.temperature as string),
      weight: parseFloat(formDataObj.weight as string),
      height: parseFloat(formDataObj.height as string),
      systolicBP: parseInt(formDataObj.systolicBP as string, 10),
      diastolicBP: parseInt(formDataObj.diastolicBP as string, 10),
      heartRate: parseInt(formDataObj.heartRate as string, 10),
      spO2: parseFloat(formDataObj.spO2 as string),
      bloodSugarLevel: parseFloat(formDataObj.bloodSugarLevel as string),
      vitalRemarks: formDataObj.vitalRemarks as string,
      afterMeal: formDataObj.afterMeal as string,
      createdById: parseInt(patientId as string, 10),
      modifiedById: parseInt(submitterId as string, 10),
    };

    try {
      // console.log('vitalFormData: ', vitalFormData);
      await addVital(vitalFormData);
      closeModal();
      toast.success('Vital added successfully.');
      refreshVitalData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error('Failed to add patient vital.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Vital</h3>
        <form onSubmit={handleAddVital} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Temperature (°C)<span className="text-red-600">*</span>
            </label>
            <input
              name="temperature"
              type="number"
              min={35}
              max={43}
              step={0.1}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Weight (kg)<span className="text-red-600">*</span>
            </label>
            <input
              name="weight"
              type="number"
              min={1}
              max={300}
              step={0.1}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Height (m)<span className="text-red-600">*</span>
            </label>
            <input
              name="height"
              type="number"
              min={0.5}
              max={2.5}
              step={0.01}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Systolic BP (mmHg)<span className="text-red-600">*</span>
            </label>
            <input
              name="systolicBP"
              type="number"
              min={90}
              max={200}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Diastolic BP (mmHg)<span className="text-red-600">*</span>
            </label>
            <input
              name="diastolicBP"
              type="number"
              min={50}
              max={120}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Heart Rate (bpm)<span className="text-red-600">*</span>
            </label>
            <input
              name="heartRate"
              type="number"
              min={40}
              max={170}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              SpO2 (%)<span className="text-red-600">*</span>
            </label>
            <input
              name="spO2"
              type="number"
              min={80}
              max={100}
              step={0.1}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Blood Sugar Level (mmol/L)
              <span className="text-red-600">*</span>
            </label>
            <input
              name="bloodSugarLevel"
              type="number"
              min={4}
              max={10}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2 ">
            <label className="block text-sm font-medium">
              Vital Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              name="vitalRemarks"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium">
              After Meal<span className="text-red-600">*</span>
            </label>
            <select
              name="afterMeal"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
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

export default AddVitalModal;
