import axios from "axios";

const BASE_URL: string = import.meta.env.VITE_BASE_URL;

export const patientsAPI = axios.create({
  baseURL: `${BASE_URL}/patients`,
});
