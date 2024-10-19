import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, MenuItem, FormControl } from '@mui/material'
import { /*CalendarIcon,*/ MailIcon, UserIcon, /*BriefcaseIcon*/ } from 'lucide-react'
import { DatePicker } from 'antd';

const ForgotPassword: React.FC = () => {
    const [supervisor, setSupervisor] = useState('');

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', width: '100%' }}>
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <img className="h-24 w-48" src="/pear.png" alt="Pear Logo" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <div className="w-full">
                            <DatePicker className="w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="nric" className="block text-sm font-medium text-gray-700">NRIC</label>
                        <div className="relative">
                            <Input id="nric" type="text" placeholder="NRIC" className="pl-10" />
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="relative">
                            <Input id="email" type="email" placeholder="Email" className="pl-10" />
                            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
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
                    </div>
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600">Reset Password</Button>
                </form>
                <div className="text-center mt-4">
                    <a href="/Login" className="text-sm text-gray-600 hover:underline">Back to Login</a>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword;