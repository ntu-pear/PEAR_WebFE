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
  AdministerTime: Dayjs | null;
  Dosage: string;
  Instruction: string;
  StartDate: string;
  EndDate: string;
  PrescriptionRemarks: string;
};

const MAX_LENGTH = 255;

const EditMedicationModal: React.FC = () => {
  const form = useForm<TEditMedicationForm>({
    mode: "onChange",
  });

  const { modalRef, activeModal, closeModal } = useModal();

  const { medicationId, submitterId, refreshMedicationData } =
    activeModal.props as {
      medicationId: string;
      submitterId: string;
      refreshMedicationData: () => void;
    };

  const { isDirty } = form.formState;

  const [startDate, setStartDate] = useState("");
  const [medication, setMedication] = useState<IMedication | null>(null);
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionList[]>([]);

  // -------------------------------
  // FETCH PRESCRIPTION LIST
  // -------------------------------
  const handleFetchPrescriptionList = async () => {
    try {
      const res: PrescriptionListView = await fetchPrescriptionList();
      setPrescriptionList(res.data);
    } catch {
      toast.error("Failed to fetch Prescription List");
    }
  };

  // -------------------------------
  // FETCH MEDICATION
  // -------------------------------
  const handleFetchMedicationById = async () => {
    if (!medicationId || isNaN(Number(medicationId))) return;

    try {
      const res = await fetchMedicationById(Number(medicationId));
      const data: IMedication = res.data;

      setMedication(data);
      setStartDate(data.StartDate);

      form.reset({
        PrescriptionListId: data.PrescriptionListId,
        AdministerTime: data.AdministerTime
          ? dayjs(data.AdministerTime, "HHmm")
          : null,
        Dosage: data.Dosage,
        Instruction: data.Instruction,
        StartDate: data.StartDate.substring(0, 10),
        EndDate: data.EndDate.substring(0, 10),
        PrescriptionRemarks: data.PrescriptionRemarks,
      });
    } catch {
      toast.error("Failed to fetch medication details");
    }
  };

  // -------------------------------
  // SUBMIT (API LOGIC KEPT)
  // -------------------------------
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
      AdministerTime: AdministerTime
        ? dayjs(AdministerTime).format("HHmm")
        : "",
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
      refreshMedicationData();
      closeModal();
    } catch {
      toast.error("Failed to update prescription.");
    }
  };

  // -------------------------------
  // CANCEL CONFIRM
  // -------------------------------
  const handleClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }

    closeModal();
  };

  // -------------------------------
  // OUTSIDE CLICK CONFIRM
  // -------------------------------
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (isDirty) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Close without saving?"
        );
        if (!confirmLeave) return;
      }

      closeModal();
    }
  };

  // -------------------------------
  // FETCH ON OPEN
  // -------------------------------
  useEffect(() => {
    handleFetchPrescriptionList().then(() =>
      handleFetchMedicationById()
    );
  }, [medicationId]);

  // -------------------------------
  // COLOR WARNING
  // -------------------------------
  const getTextColor = (length: number) => {
    if (length >= 240) return "text-red-600 font-semibold";
    if (length >= 200) return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-background p-8 rounded-md w-[600px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium mb-5">Edit Medication</h3>

        <form
          onSubmit={form.handleSubmit(handleUpdateMedication)}
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
            minuteStep={5}
            minHour={9}
            maxHour={16}
            required
          />

          <Input
            label="Dosage"
            name="Dosage"
            formReturn={form}
            required
          />

          {/* INSTRUCTION */}
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

          {/* REMARK */}
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicationModal;