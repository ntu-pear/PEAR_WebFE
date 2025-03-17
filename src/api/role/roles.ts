import { toast } from "sonner";
import { roleAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface Role {
  roleName: string;
  id: string;
  active: string;
  createdById: string;
  createdDate: string;
  modifiedById: string;
  modifiedDate: string;
}

export interface User {
  id: string;
  FullName: string;
  Role: string;
}

export const fetchRoles = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.get<{ roles: Role[] }>("/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET all roles", response.data);
    return response.data.roles;
  } catch (error) {
    toast.error(`Failed to fetch roles. ${(error as { response: { data: { detail: string } } }).response.data.detail}`);
    console.error("GET all roles", error);
    throw error;
  }
};

export const deleteRole = async (id: string) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DELETE role", response.data);
    return response.data;
  } catch (error) {
    console.error("GET all roles", error);
    throw error;
  }
};

export const createRole = async (roleName: string) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.post<Role>(
      "/",
      { roleName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Create role", response.data);
    return response.data;
  } catch (error) {
    console.error("Create role", error);
    throw error;
  }
};

export const getUsersFromRole = async (roleName: string) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.get<{ users: User[] }>(`/users/${roleName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Get users from role", response.data);
    return response.data.users;
  } catch (error) {
    toast.error(`Failed to fetch users from ${roleName} role. ${(error as { response: { data: { detail: string } } }).response.data.detail}`);
    console.error("Get users from role", error);
    throw error;
  }
};
