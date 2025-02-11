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

export interface User {
  id: string
  fullName: string
  role: string
}

export const fetchRoles = async () => {
  try {
    const token = retrieveTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await roleAPI.get<Role[]>('/', { headers: { Authorization: `Bearer ${token}` } })
    console.log('GET all roles', response.data)
    return response.data
  } catch (error) {
    toast.error('Failed to fetch roles')
    console.error('GET all roles', error)
    throw error;
  }
};

export const deleteRole = async (id: string) => {
  try {
    const token = retrieveTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await roleAPI.delete(`/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    console.log('DELETE role', response.data)
    return response.data
  } catch (error) {
    console.error('GET all roles', error)
    throw error;
  }
}

export const createRole = async (roleName: string) => {
  try {
    const token = retrieveTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await roleAPI.post<Role>('/', { roleName }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Create role', response.data)
    return response.data
  } catch (error) {
    console.error('Create role', error)
    throw error;
  }
}

export const getUsersFromRole = async (roleName: string) => {
  try {
    const token = retrieveTokenFromCookie()
    if (!token) throw new Error('Token not found')
    const response = await roleAPI.get<User[]>(`/${roleName}/users`, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Get users from role', response.data)
    return response.data
  } catch (error) {
    console.error('Get users from role', error)
    throw error;
  }
}