import { Button } from "../../ui/button";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import {
  PrescriptionList,
  PrescriptionListView,
  fetchPrescriptionList,
} from "@/api/patients/prescription";
import { getDateTimeNowInUTC } from "@/utils/formatDate";
import { useEffect, useState } from "react";
import {
  fetchMedicationById,
  IMedication,
  IMedicationFormData,
  updatePatientMedication,
} from "@/api/patients/medication";
import { SubmitHandler, useForm } from "react-hook-form";
import Select from "@/components/Form/Select";
import TimeInput from "@/components/Form/TimeInput";
import Input from "@/components/Form/Input";
import Textarea from "@/components/Form/Textarea";
import DateInput from "@/components/Form/DateInput";
import dayjs, { Dayjs } from "dayjs";

type TEditMedicationForm = {
  PrescriptionListId: number;
  AdministerTime: Dayjs;
  Dosage: string;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  PrescriptionRemarks: string;
};

const EditMedicationModal: React.FC = () => {
  const editMedicationForm = useForm<TEditMedicationForm>();
  const { modalRef, activeModal, closeModal } = useModal();
  const { medicationId, submitterId, refreshMedicationData } =
    activeModal.props as {
      medicationId: string;
      submitterId: string;
      refreshMedicationData: () => void;
    };

  const [startDate, setStartDate] = useState("");
  const [medication, setMedication] = useState<IMedication | null>(null);
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionList[]>(
    []
  );

  const handleFetchPrescriptionList = async () => {
    try {
      const prescriptionList: PrescriptionListView =
        await fetchPrescriptionList();
      setPrescriptionList(prescriptionList.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch Prescription List");
    }
  };

  const handleFetchMedicationById = async () => {
    if (!medicationId || isNaN(Number(medicationId))) return;
    try {
      const response = await fetchMedicationById(Number(medicationId));
      setMedication(response.data);
      setStartDate(response.data.StartDate);

      editMedicationForm.reset({
        PrescriptionListId: response.data.PrescriptionListId,
        AdministerTime: dayjs(response.data.AdministerTime, "HHmm"),
        Dosage: response.data.Dosage,
        Instruction: response.data.Instruction,
        StartDate: response.data.StartDate.substring(0, 10),
        EndDate: response.data.EndDate.substring(0, 10),
        PrescriptionRemarks: response.data.PrescriptionRemarks,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch medication details");
    }
  };

  const handleUpdateMedication: SubmitHandler<TEditMedicationForm> = async ({
    AdministerTime,
    ...data
  }) => {
    if (!medicationId || isNaN(Number(medicationId)) || !medication) {
      toast.error("No medication found.");
      return;
    }

    const editMedicationFormData: IMedicationFormData = {
      IsDeleted: medication.IsDeleted,
      PatientId: medication.PatientId,
      AdministerTime: dayjs(AdministerTime).format("HHmm"),
      ...data,
      CreatedDateTime: getDateTimeNowInUTC() as string,
      UpdatedDateTime: getDateTimeNowInUTC() as string,
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
    };

    try {
      await updatePatientMedication(
        Number(medicationId),
        editMedicationFormData
      );
      toast.success("Medication updated successfully.");
      closeModal();
      refreshMedicationData();
    } catch (error) {
      toast.error("Failed to update prescription.");
    }
  };

  useEffect(() => {
    handleFetchPrescriptionList();
    handleFetchMedicationById();
  }, [medicationId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Edit Medication</h3>
        <form
          onSubmit={editMedicationForm.handleSubmit(handleUpdateMedication)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <Select
              label="Prescription"
              name="PrescriptionListId"
              form={editMedicationForm}
              options={prescriptionList.map(({ Id, Value }) => ({
                value: String(Id),
                name: Value,
              }))}
              required={true}
            />
          </div>
          <TimeInput
            label="Administer Time"
            name="AdministerTime"
            form={editMedicationForm}
            minuteStep={30}
            required={true}
          />
          <Input
            label="Dosage"
            name="Dosage"
            formReturn={editMedicationForm}
            required={true}
          />
          <div className="col-span-2">
            <Textarea
              label="Instruction"
              name="Instruction"
              form={editMedicationForm}
              maxLength={255}
              required={true}
            />
          </div>
          <DateInput
            label="Start Date"
            name="StartDate"
            form={editMedicationForm}
            onChange={(e) => setStartDate(e.target.value)}
            required={true}
          />
          <DateInput
            label="End Date"
            name="EndDate"
            form={editMedicationForm}
            min={startDate}
            required={true}
          />
          <div className="col-span-2">
            <Textarea
              label="Remark"
              name="PrescriptionRemarks"
              form={editMedicationForm}
              maxLength={255}
              required={true}
            />
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicationModal;
