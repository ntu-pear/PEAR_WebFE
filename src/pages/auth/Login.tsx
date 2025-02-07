import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { currentUser, login, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target

    const formData = new FormData(event.target as HTMLFormElement);

    await login(formData);
  };

  useEffect(() => {
    if (currentUser) {
      switch (currentUser.roleName) {
        case 'ADMIN':
          navigate('/admin/temp-page', { replace: true });
          break;
        case 'CAREGIVER':
          toast.error('Caregiver is only available on mobile.');
          logout();
          break;
        case 'DOCTOR':
          navigate('/doctor/temp-page', { replace: true });
          break;
        case 'GUARDIAN':
          navigate('/guardian/temp-page', { replace: true });
          break;
        case 'GAME THERAPIST':
          navigate('/game-therapist/temp-page', { replace: true });
          break;
        case 'SUPERVISOR':
          navigate('/supervisor/manage-patients', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [currentUser, navigate]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        width: '100%',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Form Island */}
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img className="h-24 w-48" src="/pear.png" alt="Pear Logo" />
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              className="pl-10 text-gray-700"
              title="Enter a valid email address."
            />
            <UserIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={24}
            />
          </div>

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pr-10 text-gray-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOffIcon size={32} /> : <EyeIcon size={32} />}
            </button>
          </div>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            LOGIN
          </Button>
        </form>
        <div className="text-center mt-6">
          <a
            href="/forgot-password"
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <div className="text-center mt-2">
          <a
            href="/resend-registration-email"
            className="text-sm text-gray-600 hover:underline"
          >
            Resend Registration Email?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
