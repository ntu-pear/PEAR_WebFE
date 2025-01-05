import { geocodeAPI } from './apiConfig';

export interface GeocodeBase {
  fullAddress: string;
  streetAddress: string;
  postalCode: number;
  unitNumber?: string;
}

export const fetchAddress = async (
  postalCode: number,
  unitNumber?: string
): Promise<GeocodeBase> => {
  try {
    const url = unitNumber
      ? `/get_address?postalCode=${postalCode}&unitNumber=${unitNumber}`
      : `/get_address?postalCode=${postalCode}`;
    const response = await geocodeAPI.get<GeocodeBase>(`${url}`);
    console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
};
