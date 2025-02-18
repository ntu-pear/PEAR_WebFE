import { toast } from "sonner";
import { adminAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface User {
  id: string
  preferredName: string
  nric_FullName: string
  nric: string
  nric_Address: string
  nric_DateOfBirth: string
  nric_Gender: 'F' | 'M'
  roleName: string
  contactNo: string
  allowNotification: boolean
  profilePicture: string
  status: 'ACTIVE' | 'INACTIVE'
  email: string
  emailConfirmed: boolean
  verified: boolean
  active: boolean
  twoFactorEnabled: boolean
  lockoutEnabled: boolean
  lockoutReason: string | null
  createdById: string
  createdDate: Date
  modifiedById: string
  modifiedDate: Date
}

export const fetchUsers = async () => {
  try {
    const token = retrieveAccessTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await adminAPI.get<User[]>('/', { headers: { Authorization: `Bearer ${token}` } })
    console.log('GET all users', response.data)
    return response.data
  } catch (error) {
    toast.error('Failed to fetch users')
    console.error('GET all users', error)
    throw error;
  }
};

export const updateUsersRole = async (role: string, users_Id: string[]) => {
  try {
    const token = retrieveAccessTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await adminAPI.put('/reset_and_update_users_role/', { users_Id, role }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Update users role', response.data)
    return response.data
  } catch (error) {
    console.error('Update users role', error)
    throw error;
  }
}