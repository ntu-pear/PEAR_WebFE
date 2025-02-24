import { confirmNewEmail } from "@/api/users/user";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export const ConfirmNewEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      if (!token) {
        throw "Token not found in URL";
      }

      console.log("token: ", token);
      await confirmNewEmail(token);
      toast.success("New Email updated successfully.");
      navigate("/login", { replace: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(`Failed to update email. ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Confirm Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Click the button below to confirm your email address
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <Button type="button" onClick={handleConfirm}>
            Confirm Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNewEmail;
