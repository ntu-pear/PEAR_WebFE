import { getCurrentUserAPI, usersAPI } from './apiConfig';
import { refreshAccessToken, sendLogout } from './users/auth';

// Function to update the Authorization header globally
const updateAuthHeader = (access_token: string) => {
  // Update Authorization header for all future requests
  getCurrentUserAPI.defaults.headers[
    'Authorization'
  ] = `Bearer ${access_token}`;
  usersAPI.defaults.headers['Authorization'] = `Bearer ${access_token}`;
};

let interceptorId: number | null = null;

export const addAuthInterceptor = () => {
  interceptorId = getCurrentUserAPI.interceptors.response.use(
    (response) => response, // Directly return successful responses.
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (originalRequest._refreshing) {
          return Promise.reject(error); // If refresh is already in progress, reject the error.
        }
        originalRequest._refreshing = true; // Mark the token refresh as in progress.

        try {
          // Refresh and store the new access token in cookie
          const response = await refreshAccessToken();
          const { access_token } = response.data;

          // Update Authorization header for all future requests
          updateAuthHeader(access_token);

          // Update the authorization header with the new access token.
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return getCurrentUserAPI(originalRequest); // Retry the original request with the new access token.
        } catch (refreshError) {
          sendLogout();
          return Promise.reject(refreshError);
        } finally {
          originalRequest._refreshing = false; // Reset the refreshing flag after the process.
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

        if (originalRequest._refreshing) {
          return Promise.reject(error); // If refresh is already in progress, reject the error.
        }
        originalRequest._refreshing = true; // Mark the token refresh as in progress.

        try {
          // Refresh and store the new access token in cookie
          const response = await refreshAccessToken();
          const { access_token } = response.data;

          // Update Authorization header for all future requests
          updateAuthHeader(access_token);

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
          sendLogout();
          return Promise.reject(refreshError);
        } finally {
          originalRequest._refreshing = false; // Reset the refreshing flag after the process.
        }
      }
      return Promise.reject(error); // For all other errors, return the error as is.
    }
  );
};

export const ejectUsersAPIInterceptor = () => {
  if (interceptorId2 !== null) {
    getCurrentUserAPI.interceptors.response.eject(interceptorId2);
    interceptorId2 = null;
  }
};

// // Initially add the interceptor
addAuthInterceptor();
addUsersAPIInterceptor();
