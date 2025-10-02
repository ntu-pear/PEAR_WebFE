import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { getDateTimeNowInUTC } from "@/utils/formatDate";
import { toast } from "sonner";
import {
  fetchPrescriptionList,
  PrescriptionList,
  PrescriptionListView,
} from "@/api/patients/prescription";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Select from "@/components/Form/Select";
import TimeInput from "@/components/Form/TimeInput";
import Input from "@/components/Form/Input";
import Textarea from "@/components/Form/Textarea";
import DateInput from "@/components/Form/DateInput";
import {
  addPatientMedication,
  IMedicationFormData,
} from "@/api/patients/medication";
import dayjs from "dayjs";

type TAddMedicationForm = {
  PrescriptionListId: number;
  AdministerTime: string;
  Dosage: string;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  PrescriptionRemarks: string;
};

const AddMedicationModal: React.FC = () => {
  const addMedicationForm = useForm<TAddMedicationForm>();
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshMedicationData } =
    activeModal.props as {
      patientId: string;
      submitterId: string;
      refreshMedicationData: () => void;
    };

  const [prescriptionList, setPrescriptionList] = useState<PrescriptionList[]>(
    []
  );
  const [startDate, setStartDate] = useState("");

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

  const handleAddMedication: SubmitHandler<TAddMedicationForm> = async ({
    AdministerTime,
    ...data
  }: TAddMedicationForm) => {
    const addMedicationFormData: IMedicationFormData = {
      IsDeleted: "0",
      PatientId: parseInt(patientId as string, 10),
      AdministerTime: dayjs(AdministerTime).format("HHmm"),
      ...data,
      CreatedDateTime: getDateTimeNowInUTC() as string,
      UpdatedDateTime: getDateTimeNowInUTC() as string,
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
    };

    try {
      await addPatientMedication(addMedicationFormData);
      closeModal();
      toast.success("Patient medication added successfully.");
      refreshMedicationData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add patient medication. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          "Failed to add patient medication. An unknown error occurred."
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
        <h3 className="text-lg font-medium mb-5">Add Medication</h3>
        <form
          onSubmit={addMedicationForm.handleSubmit(handleAddMedication)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <Select
              label="Prescription"
              name="PrescriptionListId"
              form={addMedicationForm}
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
            form={addMedicationForm}
            minuteStep={30}
            required={true}
          />
          <Input
            label="Dosage"
            name="Dosage"
            formReturn={addMedicationForm}
            validation={{ required: true }}
          />
          <div className="col-span-2">
            <Textarea
              label="Instruction"
              name="Instruction"
              form={addMedicationForm}
              maxLength={255}
              required={true}
            />
          </div>
          <DateInput
            label="Start Date"
            name="StartDate"
            form={addMedicationForm}
            onChange={(e) => setStartDate(e.target.value)}
            required={true}
          />
          <DateInput
            label="End Date"
            name="EndDate"
            form={addMedicationForm}
            min={startDate}
            required={true}
          />
          <div className="col-span-2">
            <Textarea
              label="Remark"
              name="PrescriptionRemarks"
              form={addMedicationForm}
              maxLength={255}
              required={true}
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

export default AddMedicationModal;
