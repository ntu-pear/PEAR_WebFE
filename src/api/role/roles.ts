import { toast } from "sonner";
import { roleAPI, roleNameAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface AccessLevel {
  id: string;
  code: string;
  levelRank: number;
  levelName: string;
  description: string;
  isSystem: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  createdById: string;
  createdDate: string;
  modifiedById: string;
  modifiedDate: string;
}

export interface Role {
  id: string;
  roleName: string;
  isDeleted: boolean;
  description?: string | null;
  accessLevelId: string;
  accessLevel?: AccessLevel | null;
  createdById?: string | null;
  createdDate: string;
  modifiedById?: string | null;
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

export interface RolesResponse {
  total: number;
  page: number;
  page_size: number;
  roles: Role[];
}

export interface CreateRolePayload {
  roleName: string;
  description?: string;
  accessLevelId: string;
}

export interface UpdateRolePayload {
  roleName?: string;
  description?: string;
  accessLevelId?: string;
  isDeleted?: boolean;
}

// ---------------------------------------------------------------------------
// GET Actions
// ---------------------------------------------------------------------------

export const fetchRoles = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");

    const response = await roleAPI.get<RolesResponse>("/", {
      params: { page_size: 100 },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.roles;
  } catch (error) {
    toast.error(
      `Failed to fetch roles. ${(error as any).response?.data?.detail || "Unknown error"}`
    );
    console.error("GET all roles", error);
    throw error;
  }
};

export const fetchRolesPaginated = async (
  page: number,
  pageSize: number,
  name?: string,
  sortBy?: string,
  sortDir?: "asc" | "desc"
) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("Token not found");

  const response = await roleAPI.get<RolesResponse>("/", {
    params: {
      page,
      page_size: pageSize,
      roleName: name || undefined,
      sortBy,
      sortDir,
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchRoleNames = async () => {
  try {
    const response = await roleNameAPI.get<RoleNames>("/", {
      params: { page_size: 20 },
    });
    return response.data.roles;
  } catch (error) {
    toast.error("Failed to fetch role names.");
    console.error("GET all role names", error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// WRITE Actions
// ---------------------------------------------------------------------------

export const createRole = async (payload: CreateRolePayload) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");

    const response = await roleAPI.post<Role>("/create/", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Create role", error);
    throw error;
  }
};

export const updateRole = async (roleId: string, payload: UpdateRolePayload) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");

    const response = await roleAPI.put<Role>(`/update/${roleId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Update role", error);
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

    return response.data;
  } catch (error) {
    console.error("DELETE role", error);
    throw error;
  }
};

export const getUsersFromRole = async (roleName: string) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");

    const response = await roleAPI.get<{ users: User[] }>(`/users/${roleName}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page_size: 100 },
    });

    return response.data.users;
  } catch (error) {
    toast.error(`Failed to fetch users from ${roleName} role.`);
    console.error("Get users from role", error);
    throw error;
  }
};