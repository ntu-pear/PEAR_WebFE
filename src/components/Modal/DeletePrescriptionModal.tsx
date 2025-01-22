import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useModal } from '@/hooks/useModal';
import {
  deletePatientPrescription,
  fetchPrescriptionById,
  Prescription,
  PrescriptionDelete,
} from '@/api/patients/prescription';
import { getDateTimeNowInUTC } from '@/utils/formatDate';
import { useEffect, useState } from 'react';

const DeletePrescriptionModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { prescriptionId, submitterId, refreshPrescriptionData } =
    activeModal.props as {
      prescriptionId: string;
      submitterId: string;
      refreshPrescriptionData: () => void;
    };
  const [prescription, setPrescription] = useState<Prescription | null>(null);

  const handlefetchPrescriptionById = async (prescriptionId: string) => {
    if (!prescriptionId || isNaN(Number(prescriptionId))) return;

    const response = await fetchPrescriptionById(Number(prescriptionId));
    setPrescription(response);
  };

  const handleDeletePrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prescriptionId || isNaN(Number(prescriptionId))) return;

    if (!prescription) return;

    try {
      const prescriptionDelete: PrescriptionDelete = {
        PatientId: prescription.PatientId,
        PrescriptionListId: prescription.PrescriptionListId,
        Dosage: prescription.Dosage,
        FrequencyPerDay: prescription.FrequencyPerDay,
        Instruction: prescription.Instruction,
        StartDate: prescription.StartDate,
        PrescriptionRemarks: prescription.PrescriptionRemarks,
        UpdatedDateTime: getDateTimeNowInUTC(),
        UpdatedById: parseInt(submitterId as string, 10),
      };

      await deletePatientPrescription(
        Number(prescriptionId),
        prescriptionDelete
      );
      closeModal();
      toast.success('Prescription deleted successfully.');
      refreshPrescriptionData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error('Failed to delete patient prescription.');
    }
  };

  useEffect(() => {
    handlefetchPrescriptionById(prescriptionId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <div className="bg-destructive p-4">
          <h3 className="text-lg font-medium text-destructive-foreground">
            Are you sure?
          </h3>
        </div>

        <form onSubmit={handleDeletePrescription} className="p-4">
          <p className="mb-6 text-gray-600 dark:text-gray-200 text-center">
            Deleting this item is irreversible. Please confirm your action.
          </p>
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeletePrescriptionModal;
