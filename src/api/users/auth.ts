import { loginAPI, getCurrentUserAPI } from '../apiConfig';
import Cookies from 'js-cookie';

export interface Token {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  userId: string;
  roleName: string;
}

const TOKEN_COOKIE_NAME = 'token';
const TOKEN_EXPIRATION_TIME = 1 / 96; // 15 minutes in days

export const storeTokenInCookie = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: TOKEN_EXPIRATION_TIME,
  });
};

export const retrieveTokenFromCookie = () => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

export const sendLogin = async (formData: FormData): Promise<Token> => {
  try {
    const oAuth2FormData = new FormData();

    for (const [key, value] of formData.entries()) {
      // Map 'email' to 'username' as default oauth2 uses username and password
      const field = key === 'email' ? 'username' : key;
      // console.log('formData for Login', field, value);
      oAuth2FormData.append(field, value);
    }

    const response = await loginAPI.post('', oAuth2FormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (!response) throw new Error('Login failed, no token received.');

    console.log('POST login data', response.data);

    storeTokenInCookie(response.data.access_token);

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('POST login data', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = retrieveTokenFromCookie();
    if (!token) throw new Error('No token found.');

    const response = await getCurrentUserAPI.get('', {
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

export const sendLogout = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};
