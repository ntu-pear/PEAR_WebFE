import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect } from "react";
import { updateUser, User } from "@/api/admin/user";
import { toast } from "sonner";
import { fetchRoleNames } from "@/api/role/roles";
import { AxiosError } from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Info } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import Input from "@/components/Form/Input";
import DateInput from "@/components/Form/DateInput";
import Select from "@/components/Form/Select";
import RadioGroup from "@/components/Form/RadioGroup";
import { useState } from "react";

type Inputs = {
  preferredName: string;
  fullName: string;
  nric: string;
  address: string;
  dateOfBirth: string;
  gender: "M" | "F";
  lockOutEnabled: "true" | "false";
  lockOutReason: string;
  role: string;
  contactNo: string;
  email: string;
};

const EditAccountInfoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { accountInfo, refreshAccountData } = activeModal.props as {
    accountInfo: User & { unmaskedNric?: string };
    refreshAccountData: (updatedUser: User) => Promise<void>;
  };

  const [roles, setRoles] = useState<{ roleName: string }[]>([]);
  

  const form = useForm<Inputs>({
    defaultValues: {
      preferredName: "",
      fullName: "",
      nric: "",
      address: "",
      dateOfBirth: "",
      gender: "M",
      lockOutEnabled: "false",
      lockOutReason: "",
      role: "",
      contactNo: "",
      email: "",
    },
    mode: "onSubmit",
  });
  const lockoutEnabled = form.watch("lockOutEnabled");
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await fetchRoleNames();
        setRoles(rolesData || []);
      } catch {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
  if (lockoutEnabled === "false") {
    form.clearErrors("lockOutReason");
    form.setValue("lockOutReason", "");
  }
}, [lockoutEnabled, form]);

  useEffect(() => {
    if (accountInfo) {
      const unmaskedNric = accountInfo.unmaskedNric || accountInfo.nric || "";

      form.reset({
        preferredName: accountInfo.preferredName || "",
        fullName: accountInfo.nric_FullName || "",
        nric: unmaskedNric,
        address: accountInfo.nric_Address || "",
        dateOfBirth: accountInfo.nric_DateOfBirth || "",
        gender: (accountInfo.nric_Gender as "M" | "F") || "M",
        lockOutEnabled: accountInfo.lockOutEnabled ? "true" : "false",
        lockOutReason: accountInfo.lockOutReason || "",
        role: accountInfo.roleName || "",
        contactNo: accountInfo.contactNo || "",
        email: accountInfo.email || "",
      });
    }
  }, [accountInfo, form]);

  const handleSanitizedChange = (field: keyof Inputs, rawValue: string) => {
    let processedValue = rawValue;

    if (field === "preferredName" || field === "fullName") {
      processedValue = rawValue.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    } else if (field === "nric") {
      processedValue = rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    } else if (field === "contactNo") {
      processedValue = rawValue.replace(/[^\d]/g, "");
    } else if (field === "email") {
      processedValue = rawValue.trim().toLowerCase();
    } else if (field === "address" || field === "lockOutReason") {
      processedValue = rawValue.replace(/\s+/g, " ").trimStart();
    }

    form.setValue(field, processedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    form.clearErrors(field);
  };

  const mapBackendDetailToFormErrors = (detail: unknown) => {
    if (Array.isArray(detail)) {
      detail.forEach((item: any) => {
        const field = item?.loc?.[item.loc.length - 1];
        const message = item?.msg;

        if (!field || !message) return;

        const fieldMap: Record<string, keyof Inputs> = {
          preferredName: "preferredName",
          nric_FullName: "fullName",
          nric: "nric",
          nric_Address: "address",
          nric_DateOfBirth: "dateOfBirth",
          nric_Gender: "gender",
          lockOutReason: "lockOutReason",
          lockOutEnabled: "lockOutEnabled",
          roleName: "role",
          contactNo: "contactNo",
          email: "email",
        };

        const mappedField = fieldMap[field];
        if (mappedField) {
          form.setError(mappedField, {
            type: "server",
            message,
          });
        }
      });

      return true;
    }

    if (typeof detail === "string") {
      const lowerDetail = detail.toLowerCase();

      if (lowerDetail.includes("preferred name")) {
        form.setError("preferredName", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("full name")) {
        form.setError("fullName", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("nric")) {
        form.setError("nric", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("address")) {
        form.setError("address", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("date of birth")) {
        form.setError("dateOfBirth", { type: "server", message: detail });
        return true;
      }
      if (
        lowerDetail.includes("contact number") ||
        lowerDetail.includes("contact no")
      ) {
        form.setError("contactNo", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("email")) {
        form.setError("email", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("role")) {
        form.setError("role", { type: "server", message: detail });
        return true;
      }
      if (lowerDetail.includes("lockout reason")) {
        form.setError("lockOutReason", { type: "server", message: detail });
        return true;
      }
    }

    return false;
  };
  console.log("current role field value:", form.watch("role"));
console.log("accountInfo.roleName:", accountInfo?.roleName);
console.log(
  "role options:",
  roles.map((r) => r.roleName)
);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!accountInfo) return;

    form.clearErrors();

    const payload = {
      preferredName: data.preferredName.trim().toUpperCase(),
      nric_FullName: data.fullName.trim().toUpperCase(),
      nric: data.nric.trim().toUpperCase(),
      nric_Address: data.address.trim(),
      nric_DateOfBirth: data.dateOfBirth,
      nric_Gender: data.gender,
      lockOutEnabled: data.lockOutEnabled === "true",
      lockOutReason: data.lockOutReason.trim(),
      roleName: data.role,
      contactNo: data.contactNo.trim(),
      email: data.email.trim().toLowerCase(),
    };

    const original = {
      preferredName: accountInfo.preferredName || "",
      nric_FullName: accountInfo.nric_FullName || "",
      nric: (accountInfo.unmaskedNric || accountInfo.nric || "").trim().toUpperCase(),
      nric_Address: accountInfo.nric_Address || "",
      nric_DateOfBirth: accountInfo.nric_DateOfBirth || "",
      nric_Gender: accountInfo.nric_Gender || "",
      lockOutEnabled: !!accountInfo.lockOutEnabled,
      lockOutReason: accountInfo.lockOutReason || "",
      roleName: accountInfo.roleName || "",
      contactNo: accountInfo.contactNo || "",
      email: (accountInfo.email || "").trim().toLowerCase(),
    };

    const changedFields = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => {
        return original[key as keyof typeof original] !== value;
      })
    );

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      const updatedUser = await updateUser(accountInfo.id, changedFields);
      toast.success("Account information updated successfully.");
      closeModal();
      await refreshAccountData(updatedUser);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        const mapped = mapBackendDetailToFormErrors(detail);

        if (!mapped && typeof detail === "string" && detail.trim()) {
          toast.error(`Error ${error.response?.status}: ${detail}.`);
          return;
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-background p-8 rounded-md w-[600px] max-h-screen overflow-y-auto"
      >
        <h3 className="text-lg font-medium mb-5">Edit Account Information</h3>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preferred Name"
              name="preferredName"
              formReturn={form}
              validation={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("preferredName", e.target.value),
              }}
            />

            <Input
              label="Full Name"
              name="fullName"
              formReturn={form}
              validation={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("fullName", e.target.value),
              }}
            />

            <Input
              label="NRIC"
              name="nric"
              formReturn={form}
              validation={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("nric", e.target.value),
              }}
            />

            <Input
              label="NRIC Address"
              name="address"
              formReturn={form}
              required={false}
              validation={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("address", e.target.value),
              }}
            />

            <DateInput
              label="Date of Birth"
              name="dateOfBirth"
              form={form}
              required={true}
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

            <div>
              <label className="block text-sm font-medium">
                <div className="flex items-center gap-1">
                  <p>Lockout Enabled</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Indicates whether the account has been temporarily disabled.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </label>

              <div className="mt-2">
                <RadioGroup
                  label=""
                  name="lockOutEnabled"
                  form={form}
                  options={[
                    { label: "No", value: "false" },
                    { label: "Yes", value: "true" },
                  ]}
                />
              </div>
            </div>

            <Input
              label="Lockout Reason"
              name="lockOutReason"
              formReturn={form}
              validation={{
                required: lockoutEnabled === "true",                     
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("lockOutReason", e.target.value),
              }}
            />
    
            <Select
              label="Role"
              name="role"
              form={form}
              options={
                roles.map(({ roleName }) => ({
                  value: roleName,
                  name: roleName,
                })) || []
              }
            />

            <Input
              label="Contact Number"
              name="contactNo"
              formReturn={form}
              required={false}
              validation={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("contactNo", e.target.value),
              }}
            />

            <Input
              label="Email"
              name="email"
              formReturn={form}
              validation={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSanitizedChange("email", e.target.value),
              }}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountInfoModal;