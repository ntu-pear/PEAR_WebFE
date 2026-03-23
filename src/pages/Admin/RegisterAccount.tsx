import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import RegisterExistingGuardianModal from "@/components/Modal/RegisterExistingGuardianModal";
import Input from "@/components/Form/Input";
import RadioGroup from "@/components/Form/RadioGroup";
import DateInput from "@/components/Form/DateInput";
import Select from "@/components/Form/Select";
import useCreateUser from "@/hooks/admin/useCreateUser";
import useGetRoleNames from "@/hooks/role/useGetRoleNames";
import { AxiosError } from "axios";
import { toast } from "sonner";

type Inputs = {
  fullName: string;
  nric: string;
  address: string;
  contactNo: string;
  gender: "M" | "F";
  dateOfBirth: string;
  email: string;
  role: string;
};

const RegisterAccount: React.FC = () => {
  const { activeModal } = useModal();

  const form = useForm<Inputs>({
    defaultValues: {
      fullName: "",
      nric: "",
      address: "",
      contactNo: "",
      gender: "M",
      dateOfBirth: "",
      email: "",
      role: "",
    },
    mode: "onSubmit",
  });

  const { mutate, isPending } = useCreateUser();
  const { data } = useGetRoleNames();

  const handleSanitizedChange = (
    field: keyof Inputs,
    rawValue: string
  ) => {
    let processedValue = rawValue;

    if (field === "fullName") {
      processedValue = rawValue.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    } else if (field === "nric") {
      processedValue = rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    } else if (field === "contactNo") {
      processedValue = rawValue.replace(/[^\d]/g, "");
    } else if (field === "email") {
      processedValue = rawValue.trim().toLowerCase();
    } else if (field === "address") {
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
          nric_FullName: "fullName",
          nric: "nric",
          nric_Address: "address",
          contactNo: "contactNo",
          nric_Gender: "gender",
          nric_DateOfBirth: "dateOfBirth",
          email: "email",
          roleName: "role",
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

      if (
        lowerDetail.includes("contact number") ||
        lowerDetail.includes("contact no")
      ) {
        form.setError("contactNo", { type: "server", message: detail });
        return true;
      }

      if (
        lowerDetail.includes("date of birth") ||
        lowerDetail.includes("younger than 15") ||
        lowerDetail.includes("older than 150")
      ) {
        form.setError("dateOfBirth", { type: "server", message: detail });
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
    }

    return false;
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    form.clearErrors();

    const payload = {
      nric_FullName: data.fullName.trim().toUpperCase(),
      nric_Address: data.address.trim(),
      nric_DateOfBirth: data.dateOfBirth,
      nric_Gender: data.gender,
      contactNo: data.contactNo.trim(),
      email: data.email.trim().toLowerCase(),
      roleName: data.role,
      nric: data.nric.trim().toUpperCase(),
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Registration link sent successfully.");
        form.reset({
          fullName: "",
          nric: "",
          address: "",
          contactNo: "",
          gender: "M",
          dateOfBirth: "",
          email: "",
          role: "",
        });
      },
      onError: (error: unknown) => {
        if (error instanceof AxiosError) {
          const detail = error.response?.data?.detail;
          const mapped = mapBackendDetailToFormErrors(detail);

          if (!mapped && typeof detail === "string" && detail.trim()) {
            toast.error(`Error ${error.response?.status}: ${detail}.`);
            return;
          }
        }
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Register Account</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Personal Information
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Full Name according to NRIC"
                        name="fullName"
                        formReturn={form}
                        validation={{
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSanitizedChange("fullName", e.target.value),
                        }}
                      />
                    </div>

                    <Input
                      label="NRIC Number"
                      name="nric"
                      formReturn={form}
                      validation={{
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                          handleSanitizedChange("nric", e.target.value),
                      }}
                    />

                    <Input
                      label="Contact No."
                      name="contactNo"
                      formReturn={form}
                      validation={{
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                          handleSanitizedChange("contactNo", e.target.value),
                      }}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Address"
                        name="address"
                        formReturn={form}
                        validation={{
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSanitizedChange("address", e.target.value),
                        }}
                      />
                    </div>

                    <RadioGroup
                      label="Gender"
                      name="gender"
                      form={form}
                      options={[
                        { label: "Male", value: "M" },
                        { label: "Female", value: "F" },
                      ]}
                    />

                    <DateInput
                      label="Date of Birth"
                      name="dateOfBirth"
                      form={form}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Account Information
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      name="email"
                      formReturn={form}
                      validation={{
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                          handleSanitizedChange("email", e.target.value),
                      }}
                    />

                    <Select
                      label="Role"
                      name="role"
                      form={form}
                      options={
                        data?.map(({ roleName }) => ({
                          value: roleName,
                          name: roleName,
                        })) || []
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Sending..." : "Send registration link to email"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>

      {activeModal.name === "registerExistingGuardian" && (
        <RegisterExistingGuardianModal />
      )}
    </div>
  );
};

export default RegisterAccount;