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

const MAX_LENGTH = 255;

const AddMedicationModal: React.FC = () => {
  const form = useForm<TAddMedicationForm>({
    mode: "onChange",
  });

  const { modalRef, activeModal, closeModal } = useModal();

  const { patientId, submitterId, refreshMedicationData } =
    activeModal.props as {
      patientId: string;
      submitterId: string;
      refreshMedicationData: () => void;
    };

  const { isDirty } = form.formState;

  const [prescriptionList, setPrescriptionList] = useState<PrescriptionList[]>([]);
  const [startDate, setStartDate] = useState("");

  const handleFetchPrescriptionList = async () => {
    try {
      const res: PrescriptionListView = await fetchPrescriptionList();
      setPrescriptionList(res.data);
    } catch {
      toast.error("Failed to fetch Prescription List");
    }
  };

  // CLOSE CONFIRM
  const handleClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    closeModal();
  };

  // SUBMIT
  const handleAddMedication: SubmitHandler<TAddMedicationForm> = async ({
    AdministerTime,
    ...data
  }) => {
    const time = dayjs(AdministerTime).format("HHmm");

    const hour = parseInt(time.slice(0, 2), 10);
    const minute = time.slice(2);

    if (hour < 9 || hour > 17) {
      toast.error("Only 09:00–17:00 allowed");
      return;
    }

    if (hour === 17 && minute !== "00") {
      toast.error("Only 17:00 is allowed");
      return;
    }

    const payload: IMedicationFormData = {
      IsDeleted: "0",
      PatientId: parseInt(patientId as string, 10),
      AdministerTime: time,
      ...data,
      CreatedDateTime: getDateTimeNowInUTC() as string,
      UpdatedDateTime: getDateTimeNowInUTC() as string,
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
    };

    try {
      await addPatientMedication(payload);
      toast.success("Patient medication added successfully.");
      refreshMedicationData();
      closeModal();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add medication");
    }
  };

  useEffect(() => {
    handleFetchPrescriptionList();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (isDirty) {
          const confirmLeave = window.confirm(
            "You have unsaved changes. Close anyway?"
          );
          if (!confirmLeave) return;
        }
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDirty]);

  const getTextColor = (length: number) => {
    if (length >= 255) return "text-red-600 font-semibold";
    if (length >= 240) return "text-red-500 font-medium";
    if (length >= 200) return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Medication</h3>

        <form
          onSubmit={form.handleSubmit(handleAddMedication)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <Select
              label="Prescription"
              name="PrescriptionListId"
              form={form}
              options={prescriptionList.map(({ Id, Value }) => ({
                value: String(Id),
                name: Value,
              }))}
              required
            />
          </div>

          <TimeInput
            label="Administer Time"
            name="AdministerTime"
            form={form}
            minHour={9}
            maxHour={16}
          />

          <Input
            label="Dosage"
            name="Dosage"
            formReturn={form}
            validation={{ required: true }}
          />

          <div className="col-span-2">
            <Textarea
              label="Instruction"
              name="Instruction"
              form={form}
              maxLength={MAX_LENGTH}
              required
            />

            <div
              className={`flex justify-end text-sm mt-1 ${getTextColor(
                form.watch("Instruction")?.length || 0
              )}`}
            >
              {form.watch("Instruction")?.length || 0}/{MAX_LENGTH}
            </div>
          </div>

          <DateInput
            label="Start Date"
            name="StartDate"
            form={form}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <DateInput
            label="End Date"
            name="EndDate"
            form={form}
            min={startDate}
            required
          />

          <div className="col-span-2">
            <Textarea
              label="Remark"
              name="PrescriptionRemarks"
              form={form}
              maxLength={MAX_LENGTH}
              required
            />

            <div
              className={`flex justify-end text-sm mt-1 ${getTextColor(
                form.watch("PrescriptionRemarks")?.length || 0
              )}`}
            >
              {form.watch("PrescriptionRemarks")?.length || 0}/{MAX_LENGTH}
            </div>
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty}>
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;