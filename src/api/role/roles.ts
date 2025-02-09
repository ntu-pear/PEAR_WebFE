import { toast } from "sonner";
import { roleAPI } from "../apiConfig";
import { retrieveTokenFromCookie } from "../users/auth";

export interface Role {
  roleName: string;
  id: string
  active: string
  createdById: string
  createdDate: string
  modifiedById: string
  modifiedDate: string
}

export const fetchRoles = async () => {
  try {
    const token = retrieveTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await roleAPI.get<Role[]>('/')
    console.log('GET all roles', response.data)
    return response.data
  } catch (error) {
    toast.error('Failed to fetch roles')
    console.error('GET all roles', error)
    throw error;
  }
};