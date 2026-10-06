import type { AxiosInstance } from "axios";

export const attachLoggerAuth = (
  instance: AxiosInstance,
  getToken: () => string | undefined | null,
  onForbidden: () => void
): AxiosInstance => {
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 403) {
        onForbidden();
      }
      return Promise.reject(error);
    }
  );
  return instance;
};
