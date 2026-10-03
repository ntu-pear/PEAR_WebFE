import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../../ui/button";
import Input from "../../Form/Input";
import Select from "../../Form/Select";
import DateInput from "../../Form/DateInput";
import RadioGroup from "../../Form/RadioGroup";
import {
  guardianSchema,
  GuardianFormInputs,
  RELATIONSHIP_OPTIONS,
} from "@/utils/guardianValidation";
import { addPatientGuardian, IGuardianFormData } from "@/api/patients/guardian";
import { convertToUTCISOString, getDateTimeNowInUTC } from "@/utils/formatDate";
import { extractErrorMessage } from "@/utils/errorMessage";
import { mapBackendErrorToField } from "@/utils/mapBackendErrorToForm";
import { GUARDIAN_FIELD_KEYWORD_MAP } from "@/utils/guardianFieldKeywordMap";

const AddGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, refreshGuardianData } = activeModal.props as {
    patientId: number;
    refreshGuardianData: () => void | Promise<void>;
  };
  const { currentUser } = useAuth();

  const form = useForm<GuardianFormInputs>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      gender: "M",
      contactNo: "",
      nric: "",
      email: "",
      dateOfBirth: "",
      address: "",
      tempAddress: "",
      relationshipName: "",
    },
  });

  const handleAddGuardian = async (values: GuardianFormInputs) => {
    if (!patientId || !currentUser?.userId) {
      toast.error("Missing patient or current user information.");
      return;
    }

    const creator = String(currentUser.userId);
    const now = getDateTimeNowInUTC();

    const payload: IGuardianFormData = {
      active: "Y",
      firstName: values.firstName,
      lastName: values.lastName,
      preferredName: values.preferredName || "",
      gender: values.gender,
      contactNo: values.contactNo,
      nric: values.nric,
      email: values.email?.trim() === "" ? null : values.email,
      dateOfBirth: convertToUTCISOString(values.dateOfBirth),
      address: values.address,
      tempAddress: values.tempAddress || "",
      status: "Y",
      isDeleted: "0",
      guardianApplicationUserId: null,
      createdDate: now,
      modifiedDate: now,
      CreatedById: creator,
      ModifiedById: creator,
      patientId,
      relationshipName: values.relationshipName,
    };

    try {
      await addPatientGuardian(payload);
      toast.success("Guardian added successfully.");
      closeModal();
      await refreshGuardianData?.();
    } catch (error) {
      const mappedToField = mapBackendErrorToField(error, form, GUARDIAN_FIELD_KEYWORD_MAP);
      if (!mappedToField) {
        toast.error(extractErrorMessage(error, "Failed to add guardian."));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-5">Add Guardian</h3>
        <form
          onSubmit={form.handleSubmit(handleAddGuardian)}
          className="grid grid-cols-2 gap-x-4"
        >
          <Input label="First Name" name="firstName" formReturn={form} uppercase />
          <Input label="Last Name" name="lastName" formReturn={form} uppercase />
          <Input
            label="Preferred Name"
            name="preferredName"
            formReturn={form}
            uppercase
          />
          <RadioGroup
            label="Gender"
            name="gender"
            form={form}
            options={[
              { label: "Male", value: "M" },
              { label: "Female", value: "F" },
            ]}
          />
          <Input label="NRIC" name="nric" formReturn={form} uppercase />
          <Input label="Contact Number" name="contactNo" formReturn={form} />
          <DateInput label="Date of Birth" name="dateOfBirth" form={form} />
          <Select
            label="Relationship"
            name="relationshipName"
            form={form}
            options={RELATIONSHIP_OPTIONS.map((r) => ({ value: r, name: r }))}
          />
          <div className="col-span-2">
            <Input label="Address" name="address" formReturn={form} uppercase />
          </div>
          <div className="col-span-2">
            <Input
              label="Temporary Address"
              name="tempAddress"
              formReturn={form}
              validation={{ required: false }}
              uppercase
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Email"
              name="email"
              formReturn={form}
              validation={{ required: false }}
            />
          </div>

          <div className="col-span-2 mt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuardianModal;
