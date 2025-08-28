// src/api/lists.ts
import { listTypesAPI, VITE_PATIENT_SERVICE_URL } from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { TableRowData } from "@/components/Table/DataTable";
import { mockListTypes } from "@/mocks/mockLists";
import axios from "axios";

interface ListType {
  active: string;
  type: string;
  value: string;
  listOrder: number;
  id: number;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface ListItem extends TableRowData {
  type: string;
  value: string;
}

// TBD: Replace with real API
export async function fetchListItems(type: string): Promise<ListItem[]> {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  const listType = mockListTypes.find((lt) => lt.type === type);
  if (!listType) throw new Error(`List type ${type} not found.`);

  const res = await axios
    .create({ baseURL: `${VITE_PATIENT_SERVICE_URL}${listType.get}` })
    .get<any>("?require_auth=true&pageNo=0&pageSize=100", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  console.log(`GET all List Items for type ${type}`, res.data);

  if (Array.isArray(res.data)) {
    return res.data.map(({ Value, value }, index) => ({
      id: index,
      type,
      value: Value ?? value,
    }));
  }
  return res.data.data.map(({ Value, value }, index) => ({
    id: index,
    type,
    value: Value ?? value,
  }));
}

// TBD: Replace with real API
export async function fetchListTypes(): Promise<
  { type: string; get: string }[]
> {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  const res = await listTypesAPI.get<ListType[]>("", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("GET all List Types", res.data);

  return mockListTypes;
}
