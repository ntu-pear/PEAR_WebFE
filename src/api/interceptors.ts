import { getCurrentUserAPI, usersAPI } from './apiConfig';
import { refreshAccessToken, sendLogout } from './users/auth';

let isRefreshing = false;
//List that stores callback function with token param, for all pending 401 requests from axios instance below
let refreshSubscribers: ((token: string) => void)[] = [];

// Pass the new token to each pending 401 requests in the refreshSubscribers list,
// then call their respectively callback function and clear the list afterwards
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Add pending 401 requests from axios instances below to refreshSubscriber queue
const addSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Update the respective Authorization headers for future requests
export const updateAuthHeader = (token: string) => {
  getCurrentUserAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
};

// Clear the respectively Authorization headers (for logout)
export const clearAuthHeaders = () => {
  delete getCurrentUserAPI.defaults.headers['Authorization'];
  delete usersAPI.defaults.headers['Authorization'];
};

let interceptorId: number | null = null;

export const addAuthInterceptor = () => {
  interceptorId = getCurrentUserAPI.interceptors.response.use(
    (response) => response, // Directly return successful responses.
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve) => {
            addSubscriber((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(getCurrentUserAPI(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          // Refresh and store the new access token in cookie
          const response = await refreshAccessToken();
          const { access_token } = response.data;
          updateAuthHeader(access_token);
          onTokenRefreshed(access_token);

          // Update the authorization header with the new access token.
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return getCurrentUserAPI(originalRequest); // Retry the original request with the new access token.
        } catch (refreshError) {
          await sendLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Reset the refreshing flag after the process.
        }
      }
      return Promise.reject(error); // For all other errors, return the error as is.
    }
  );
};

// Function to remove the interceptor
export const ejectAuthInterceptor = () => {
  if (interceptorId !== null) {
    getCurrentUserAPI.interceptors.response.eject(interceptorId);
    interceptorId = null;
  }
};

let interceptorId2: number | null = null;

export const addUsersAPIInterceptor = () => {
  interceptorId2 = usersAPI.interceptors.response.use(
    (response) => response, // Directly return successful responses.
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve) => {
            addSubscriber((token) => {
              const fullUrl = originalRequest.baseURL + originalRequest.url!;
              const url = new URL(fullUrl);
              console.log('Original Full URL:', url.href);
              url.searchParams.set('token', token);
              originalRequest.url = url.toString();
              resolve(usersAPI(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          // Refresh and store the new access token in cookie
          const response = await refreshAccessToken();
          const { access_token } = response.data;

          // Update Authorization header for all future requests
          updateAuthHeader(access_token);
          onTokenRefreshed(access_token);

          // Update the query string token with the new access token.
          // Concatenate baseURL and relative url to form the full URL
          const fullUrl = originalRequest.baseURL + originalRequest.url!;

          // Create a URL object from the full URL string
          const url = new URL(fullUrl);

          console.log('Original Full URL:', url.href);

          // Update the query string token with the new access token
          url.searchParams.set('token', access_token);

          // Set the updated URL back to the original request
          originalRequest.url = url.toString();

          return usersAPI(originalRequest); // Retry the original request with the new access token.
        } catch (refreshError) {
          await sendLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Reset the refreshing flag after the process.
        }
      }
      return Promise.reject(error); // For all other errors, return the error as is.
    }
  );
};

export const ejectUsersAPIInterceptor = () => {
  if (interceptorId2 !== null) {
    usersAPI.interceptors.response.eject(interceptorId2);
    interceptorId2 = null;
  }
};

// // Initially add the interceptor
addAuthInterceptor();
addUsersAPIInterceptor();
