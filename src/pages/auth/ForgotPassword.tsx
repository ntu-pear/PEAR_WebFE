import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  /*CalendarIcon,*/ MailIcon,
  UserIcon /*BriefcaseIcon*/,
} from 'lucide-react';
import { DatePicker } from 'antd';

const ForgotPassword: React.FC = () => {
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
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        <form className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <div className="w-full">
              <DatePicker className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="nric"
              className="block text-sm font-medium text-gray-700"
            >
              NRIC
            </label>
            <div className="relative">
              <Input
                id="nric"
                type="text"
                placeholder="NRIC"
                className="pl-10 text-gray-700"
              />
              <UserIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="pl-10 text-gray-700"
              />
              <MailIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Role
              </label>
              <select
                name="roleName"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              >
                <option value="">Select Role</option>
                <option value="ADMIN">Administrator</option>
                <option value="CAREGIVER">Caregiver</option>
                <option value="DOCTOR">Doctor</option>
                <option value="GAME THERAPIST">Game Therapist</option>
                <option value="GUARDIAN">Guardian</option>
                <option value="SUPERVISOR">Supervisor</option>
              </select>
            </div>
          </div>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            Reset Password
          </Button>
        </form>
        <div className="text-center mt-4">
          <a href="/Login" className="text-sm text-gray-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
