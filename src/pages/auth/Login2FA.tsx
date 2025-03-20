import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatRoleName } from "@/utils/formatRoleName";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Login2FA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login2FA, logout } = useAuth();

  const email = location.state?.email;

  const handleLogin2FA = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      toast.error("Missing email for 2FA verification.");
      return;
    }
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);
    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());
    const code = formDataObj.code as string;

    await login2FA(email, code);
  };

  useEffect(() => {
    if (currentUser?.roleName) {
      const formattedRoleName = formatRoleName(currentUser.roleName);
      switch (currentUser.roleName) {
        case "ADMIN":
          // navigate("/admin/temp-page", { replace: true });
          navigate("/admin/manage-accounts", { replace: true });
          break;
        case "CAREGIVER":
          toast.error("Caregiver is only available on mobile.");
          logout();
          break;
        case "DOCTOR":
          // navigate("/doctor/temp-page", { replace: true });
          navigate("/doctor/manage-patients", { replace: true });
          break;
        case "GUARDIAN":
          navigate("/guardian/temp-page", { replace: true });
          break;
        case "GAME THERAPIST":
          navigate("/game-therapist/temp-page", { replace: true });
          break;
        case "SUPERVISOR":
          navigate("/supervisor/manage-patients", { replace: true });
          break;
        default:
          navigate(`/${formattedRoleName}/temp-page`, { replace: true });
          break;
      }
    }
  }, [currentUser, navigate]);

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
          Two Factor Authentication
        </h2>
        <form className="space-y-4" onSubmit={handleLogin2FA}>
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              2FA OTP <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="code"
                name="code"
                type="text"
                minLength={6}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 2FA OTP"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login2FA;
