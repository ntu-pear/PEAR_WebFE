import { toast } from "sonner";
import { roleAPI, roleNameAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface Role {
  roleName: string;
  id: string;
  active: string;
  accessLevelSensitive: 0 | 1 | 2 | 3;
  createdById: string;
  createdDate: string;
  modifiedById: string;
  modifiedDate: string;
}

export interface RoleName {
  roleName: string;
}

export interface RoleNames {
  roles: RoleName[];
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
      params: { page_size: 100 },
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET all roles", response.data);
    return response.data.roles;
  } catch (error) {
    toast.error(
      `Failed to fetch roles. ${(error as { response: { data: { detail: string } } }).response.data.detail}`
    );
    console.error("GET all roles", error);
    throw error;
  }
};

export const fetchRoleNames = async () => {
  try {
    const response = await roleNameAPI.get<RoleNames>("/", {
      params: { page_size: 20 },
    });
    console.log("GET all role names", response.data);
    return response.data.roles;
  } catch (error) {
    toast.error(
      `Failed to fetch role names. ${(error as { response: { data: { detail: string } } }).response.data.detail}`
    );
    console.error("GET all role names", error);
    throw error;
  }
};

export const deleteRole = async (id: string) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.delete(`/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DELETE role", response.data);
    return response.data;
  } catch (error) {
    console.error("GET all roles", error);
    throw error;
  }
};

export const createRole = async (
  roleName: string,
  accessLevelSensitive: 0 | 1 | 2 | 3
) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.post<Role>(
      "/create/",
      { roleName, accessLevelSensitive },
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
    const response = await roleAPI.get<{ users: User[] }>(
      `/users/${roleName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 },
      }
    );
    console.log("Get users from role", response.data);
    return response.data.users;
  } catch (error) {
    toast.error(
      `Failed to fetch users from ${roleName} role. ${(error as { response: { data: { detail: string } } }).response.data.detail}`
    );
    console.error("Get users from role", error);
    throw error;
  }
};

export const updateRole = async (
  roleId: string,
  roleName: string,
  active: boolean,
  privacyLevelSensitive: 0 | 1 | 2 | 3
) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await roleAPI.put<Role>(
      `/update/${roleId}`,
      { roleName, active, privacyLevelSensitive },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Update role", response.data);
    return response.data;
  } catch (error) {
    console.error("Update role", error);
    throw error;
  }
};
