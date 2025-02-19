import {
  loginAPI,
  getCurrentUserAPI,
  refreshTokenAPI,
  logoutAPI,
  verifyOTP,
} from '../apiConfig';
import Cookies from 'js-cookie';
import {
  addAuthInterceptor,
  addUsersAPIInterceptor,
  clearAuthHeaders,
  ejectAuthInterceptor,
  ejectUsersAPIInterceptor,
} from '../interceptors';

export interface Token {
  access_token: string;
  refresh_token: string;
}

export interface Require2FA {
  email: string;
  msg: string;
}

export interface CurrentUser {
  userId: string;
  roleName: string;
  fullName: string;
}

const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

export const storeTokenInCookie = (
  access_token: string,
  refresh_token: string
) => {
  Cookies.set(ACCESS_TOKEN_COOKIE_NAME, access_token);

  Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refresh_token);
};

export const updateAccessTokenInCookie = (access_token: string) => {
  Cookies.set(ACCESS_TOKEN_COOKIE_NAME, access_token);
};

export const retrieveAccessTokenFromCookie = () => {
  return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
};

export const retrieveRefreshTokenFromCookie = () => {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
};

export const sendLogin = async (
  formData: FormData
): Promise<Token | Require2FA> => {
  try {
    const oAuth2FormData = new FormData();

    for (const [key, value] of formData.entries()) {
      // Map 'email' to 'username' as default oauth2 uses username and password
      const field = key === 'email' ? 'username' : key;
      // console.log('formData for Login', field, value);
      oAuth2FormData.append(field, value);
    }

    const response = await loginAPI.post('/', oAuth2FormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('POST login data', response.data);

    storeTokenInCookie(response.data.access_token, response.data.refresh_token);
    addAuthInterceptor();
    addUsersAPIInterceptor();
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('POST login data', error);
    throw error;
  }
};

export const sendLogin2FA = async (
  user_email: string,
  code: string
): Promise<Token> => {
  try {
    const response = await verifyOTP.get(
      `/?user_email=${user_email}&code=${code}`
    );

    console.log('GET login 2FA data', response.data);

    storeTokenInCookie(response.data.access_token, response.data.refresh_token);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('GET login data', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error('No token found.');

    const response = await getCurrentUserAPI.get('/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('GET current user', response.data);
    return response.data;
  } catch (error) {
    console.error('GET current user', error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refresh_token = retrieveRefreshTokenFromCookie();
    if (!refresh_token) throw new Error('No refresh token found.');

    const response = await refreshTokenAPI.post('/', { refresh_token });
    updateAccessTokenInCookie(response.data.access_token);

    console.log('POST refresh user access token.', response);
    return response;
  } catch (error) {
    console.error('POST refresh user access token.');
    throw error;
  }
};

export const sendLogout = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error('No token found.');

    Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME);
    ejectAuthInterceptor();
    ejectUsersAPIInterceptor();
    clearAuthHeaders();

    const response = await logoutAPI.delete(`/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Delete user logout', response);
    return response;
  } catch (error) {
    console.error('Delete user logout.');
    throw error;
  }
};
