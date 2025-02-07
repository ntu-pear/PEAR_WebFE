import { resetPassword, ResetPasswordForm } from '@/api/users/auth';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const newPassword = form.newPassword as HTMLInputElement;
    const confirmPassword = form.confirmNewPassword as HTMLInputElement;

    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Password does not match');
      confirmPassword.reportValidity();
      return;
    } else {
      confirmPassword.setCustomValidity('');
    }

    const resetPasswordFormData: ResetPasswordForm = {
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    };

    try {
      if (!token) {
        throw 'Token not found in URL';
      }

      console.log('resetPasswordFormData: ', resetPasswordFormData);
      console.log('token: ', token);
      await resetPassword(resetPasswordFormData, token);
      toast.success('Password reset succesfully.');
      navigate('/login', { replace: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(`Failed to reset password. ${error}`);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        width: '100%',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img className="h-24 w-48" src="/pear.png" alt="Pear Logo" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="New Password"
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?=.*[^ ]).{6,}$"
                title="Must contain at least one lowercase letter, one uppercase letter, one non-alphanumeric character, no spaces, and at least 6 characters."
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                placeholder="Confirm New Password"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                onInput={(e) => e.currentTarget.setCustomValidity('')}
                required
              />
            </div>
          </div>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
