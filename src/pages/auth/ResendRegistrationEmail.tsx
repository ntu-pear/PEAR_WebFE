import {
  RequestResetPasswordForm,
  resendRegistrationEmail,
} from "@/api/users/user";
import { Button } from "@/components/ui/button";
import useGetRoleNames from "@/hooks/role/useGetRoleNames";
import { useState } from "react";
import { toast } from "sonner";

const ResendRegistrationEmail: React.FC = () => {
  const [nric, setNRIC] = useState<string>("");
  const roles = useGetRoleNames();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const upperCaseValue = value.toUpperCase();
    setNRIC(upperCaseValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.toUpperCase();
  };

  const handleResendRegistrationEmail = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const resendRegistrationEmailFormData: RequestResetPasswordForm = {
      nric_DateOfBirth: formDataObj.dateOfBirth as string,
      nric: formDataObj.nric as string,
      email: formDataObj.email as string,
      roleName: formDataObj.roleName as string,
    };

    try {
      console.log(
        "resendRegistrationEmailFormData: ",
        resendRegistrationEmailFormData
      );
      await resendRegistrationEmail(resendRegistrationEmailFormData);
      toast.success("A new registration link have been sent to your email.");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Invalid Details. Failed to send registration link");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        width: "100%",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img className="h-24 w-48" src="/pear.png" alt="Pear Logo" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">
          Resend Registration Email
        </h2>
        <form className="space-y-4" onSubmit={handleResendRegistrationEmail}>
          <div className="space-y-2">
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth <span className="text-red-600">*</span>
            </label>
            <div className="w-full">
              <input
                type="date"
                name="dateOfBirth"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="nric"
              className="block text-sm font-medium text-gray-700"
            >
              NRIC <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="nric"
                name="nric"
                type="text"
                value={nric}
                pattern="^(S|T|F|G)\d{7}[A-Z]$"
                minLength={9}
                maxLength={9}
                onChange={(e) => handleChange(e)}
                onKeyDown={(e) => handleKeyDown(e)}
                placeholder="NRIC"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Role <span className="text-red-600">*</span>
              </label>
              <select
                name="roleName"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              >
                <option value="">Select Role</option>
                {roles.data?.map((role) => (
                  <option value={role.roleName}>{role.roleName}</option>
                ))}
              </select>
            </div>
          </div>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            Resend Registration Email
          </Button>
        </form>
        <div className="text-center mt-4">
          <a href="/login" className="text-sm text-gray-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResendRegistrationEmail;
