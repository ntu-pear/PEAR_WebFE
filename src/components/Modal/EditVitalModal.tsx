import { updateVital, VitalFormData } from '@/api/patients/vital';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useModal } from '@/hooks/useModal';
import { VitalCheckTD } from '@/mocks/mockPatientDetails';
import { useEffect, useState } from 'react';

const EditVitalModal: React.FC = () => {
  const [rowData, setRowData] = useState<VitalFormData | null>(null);
  const { modalRef, activeModal, closeModal } = useModal();
  const { vitalId, vitalData, patientId, submitterId, refreshVitalData } =
    activeModal.props as {
      vitalId: string;
      vitalData: VitalCheckTD;
      patientId: string;
      submitterId: string;
      refreshVitalData: () => void;
    };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (rowData) {
      setRowData({ ...rowData, [name]: value });
    }
  };

  const handleEditVital = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!vitalId || isNaN(Number(vitalId))) return;

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const vitalFormData: VitalFormData = {
      PatientId: parseInt(patientId as string, 10),
      Temperature: parseFloat(formDataObj.Temperature as string),
      Weight: parseFloat(formDataObj.Weight as string),
      Height: parseFloat(formDataObj.Height as string),
      SystolicBP: parseInt(formDataObj.SystolicBP as string, 10),
      DiastolicBP: parseInt(formDataObj.DiastolicBP as string, 10),
      HeartRate: parseInt(formDataObj.HeartRate as string, 10),
      SpO2: parseFloat(formDataObj.SpO2 as string),
      BloodSugarLevel: parseFloat(formDataObj.BloodSugarLevel as string),
      VitalRemarks: formDataObj.VitalRemarks as string,
      IsAfterMeal: formDataObj.IsAfterMeal as string,
      UpdatedById: parseInt(submitterId as string, 10),
    };

    try {
      // console.log('vitalFormData: ', vitalFormData);
      await updateVital(Number(vitalId), vitalFormData);
      closeModal();
      toast.success('Vital updated successfully.');
      refreshVitalData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error('Failed to update patient vital.');
    }
  };

  useEffect(() => {
    if (vitalData) {
      setRowData({
        Temperature: vitalData.temperature,
        Weight: vitalData.weight,
        Height: vitalData.height,
        SystolicBP: vitalData.systolicBP,
        DiastolicBP: vitalData.diastolicBP,
        HeartRate: vitalData.heartRate,
        SpO2: vitalData.spO2,
        BloodSugarLevel: vitalData.bloodSugarLevel,
        VitalRemarks: vitalData.remark,
        IsAfterMeal: vitalData.afterMeal,
      });
    }
  }, [vitalData, patientId, submitterId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Edit Vital</h3>
        <form onSubmit={handleEditVital} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Temperature (°C)<span className="text-red-600">*</span>
            </label>
            <input
              name="Temperature"
              type="number"
              min={35}
              max={38}
              step={0.1}
              value={rowData?.Temperature ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Weight (kg)<span className="text-red-600">*</span>
            </label>
            <input
              name="Weight"
              type="number"
              min={40}
              max={150}
              step={0.1}
              value={rowData?.Weight ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Height (m)<span className="text-red-600">*</span>
            </label>
            <input
              name="Height"
              type="number"
              min={1.2}
              max={2.2}
              step={0.01}
              value={rowData?.Height ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Systolic BP (mmHg)<span className="text-red-600">*</span>
            </label>
            <input
              name="SystolicBP"
              type="number"
              min={91}
              max={140}
              value={rowData?.SystolicBP ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Diastolic BP (mmHg)<span className="text-red-600">*</span>
            </label>
            <input
              name="DiastolicBP"
              type="number"
              min={61}
              max={90}
              value={rowData?.DiastolicBP ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Heart Rate (bpm)<span className="text-red-600">*</span>
            </label>
            <input
              name="HeartRate"
              type="number"
              min={60}
              max={100}
              value={rowData?.HeartRate ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              SpO2 (%)<span className="text-red-600">*</span>
            </label>
            <input
              name="SpO2"
              type="number"
              min={95}
              max={100}
              step={0.1}
              value={rowData?.SpO2 ?? ''}
              onChange={handleChange}
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
              name="BloodSugarLevel"
              type="number"
              min={6}
              max={13}
              value={rowData?.BloodSugarLevel ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2 ">
            <label className="block text-sm font-medium">
              Vital Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              name="VitalRemarks"
              value={rowData?.VitalRemarks ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium">
              After Meal<span className="text-red-600">*</span>
            </label>
            <select
              name="IsAfterMeal"
              value={rowData?.IsAfterMeal ?? ''}
              onChange={handleChange}
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
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVitalModal;