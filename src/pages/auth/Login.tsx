import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon, UserIcon } from 'lucide-react'
import { Select, MenuItem, FormControl } from '@mui/material'

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [supervisor, setSupervisor] = useState('');

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', width: '100%' }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Form Island */}
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img className="h-24 w-48" src="/pear.png" alt="Pear Logo" />
        </div>
        <form className="space-y-4">
          <div className="relative">
            <Input type="text" placeholder="Username/Email" className="pl-10" />
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <FormControl fullWidth>
            <Select
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className="bg-background border border-input"
            >
              <MenuItem value="" disabled>
                Select Role
              </MenuItem>
              <MenuItem value="supervisor1">Administrator</MenuItem>
              <MenuItem value="supervisor2">Caregiver</MenuItem>
              <MenuItem value="supervisor3">Doctor</MenuItem>
              <MenuItem value="supervisor1">Game Therapist</MenuItem>
              <MenuItem value="supervisor2">Guardian</MenuItem>
              <MenuItem value="supervisor3">Supervisor</MenuItem>
            </Select>
          </FormControl>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600">LOGIN</Button>
        </form>
        <div className="text-center mt-4">
          <a href="/ForgotPassword" className="text-sm text-gray-600 hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
