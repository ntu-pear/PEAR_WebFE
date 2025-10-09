import { Button } from "../../ui/button";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import {
  updatePatientPrescription,
  fetchPrescriptionById,
  Prescription,
  PrescriptionList,
  PrescriptionUpdate,
  PrescriptionListView,
  fetchPrescriptionList,
} from "@/api/patients/prescription";
import { getDateTimeNowInUTC } from "@/utils/formatDate";
import { useEffect, useState } from "react";

const EditPrescriptionModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { prescriptionId, submitterId, refreshPrescriptionData } =
    activeModal.props as {
      prescriptionId: string;
      submitterId: string;
      refreshPrescriptionData: () => void;
    };

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionList[]>(
    []
  );
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    const handleFetchPrescriptionList = async () => {
      try {
        const prescriptionList: PrescriptionListView =
          await fetchPrescriptionList();
        setPrescriptionList(prescriptionList.data);
      } catch (error) {
        toast.error("Failed to fetch Prescription List");
      }
    };

    const handleFetchPrescriptionById = async () => {
      if (!prescriptionId || isNaN(Number(prescriptionId))) return;
      try {
        const response = await fetchPrescriptionById(Number(prescriptionId));
        setPrescription(response.data);
        setStartDate(response.data.StartDate);
      } catch (error) {
        toast.error("Failed to fetch prescription details");
      }
    };

    handleFetchPrescriptionList();
    handleFetchPrescriptionById();
  }, [prescriptionId]);

  const handleUpdatePrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prescription || !prescriptionId || isNaN(Number(prescriptionId)))
      return;

    try {
      const updatedPrescription: PrescriptionUpdate = {
        PatientId: prescription.PatientId,
        PrescriptionListId: prescription.PrescriptionListId,
        Dosage: prescription.Dosage,
        FrequencyPerDay: prescription.FrequencyPerDay,
        Instruction: (prescription.Instruction as string).trim(),
        StartDate: startDate,
        EndDate: prescription.EndDate,
        IsAfterMeal: prescription.IsAfterMeal,
        PrescriptionRemarks: prescription.PrescriptionRemarks.trim(),
        Status: prescription.Status,
        UpdatedDateTime: getDateTimeNowInUTC() as string,
        ModifiedById: submitterId as string,
      };

      console.log(updatedPrescription);

      await updatePatientPrescription(
        Number(prescriptionId),
        updatedPrescription
      );
      toast.success("Prescription updated successfully.");
      closeModal();
      refreshPrescriptionData();
    } catch (error) {
      toast.error("Failed to update prescription.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Medical Prescription</h3>
        {prescription ? (
          <form
            onSubmit={handleUpdatePrescription}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium">
                Prescription<span className="text-red-600">*</span>
              </label>
              <select
                name="PrescriptionListId"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                value={prescription.PrescriptionListId}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    PrescriptionListId: Number(e.target.value),
                  })
                }
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
                value={prescription.IsAfterMeal}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    IsAfterMeal: e.target.value,
                  })
                }
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
                value={prescription.Dosage}
                onChange={(e) =>
                  setPrescription({ ...prescription, Dosage: e.target.value })
                }
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
                value={prescription.FrequencyPerDay}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    FrequencyPerDay: Number(e.target.value),
                  })
                }
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
                value={prescription.Status}
                onChange={(e) =>
                  setPrescription({ ...prescription, Status: e.target.value })
                }
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
                value={prescription.Instruction}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    Instruction: e.target.value,
                  })
                }
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
                  defaultValue={prescription.StartDate.substring(0, 10)}
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
                  defaultValue={prescription.EndDate.substring(0, 10)}
                  onChange={(e) =>
                    setPrescription({
                      ...prescription,
                      EndDate: e.target.value,
                    })
                  }
                  min={startDate}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium">
                Prescription Remarks
              </label>
              <textarea
                name="PrescriptionRemarks"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                value={prescription.PrescriptionRemarks}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    PrescriptionRemarks: e.target.value,
                  })
                }
                maxLength={255}
              />
            </div>

            <div className="col-span-2 flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" variant="save">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-500">Loading prescription data...</p>
        )}
      </div>
    </div>
  );
};

export default EditPrescriptionModal;
