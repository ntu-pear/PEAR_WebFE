import axios from 'axios';
import { loginAPI, getCurrentUserAPI, userAPI } from '../apiConfig';
import Cookies from 'js-cookie';

export interface Token {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  userId: string;
  roleName: string;
}

export interface RequestResetPasswordForm {
  nric_DateOfBirth: string;
  nric: string;
  email: string;
  roleName: string;
}

export interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
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

export const requestResetPassword = async (
  requestResetPasswordForm: RequestResetPasswordForm
) => {
  try {
    const response = await userAPI.post(
      `/request_reset_password/`,
      requestResetPasswordForm
    );
    console.log('POST request reset password', response.data);
    return response.data;
  } catch (error) {
    console.error('POST request reset password', error);
    throw error;
  }
};

export const resetPassword = async (
  resetPasswordForm: ResetPasswordForm,
  token: string
) => {
  try {
    const response = await userAPI.post(
      `/reset_user_password/`,
      resetPasswordForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('POST reset password', response.data);
    return response.data;
  } catch (error) {
    console.error('POST reset password', error);

    if (axios.isAxiosError(error)) {
      // Extract error response if available
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Something went wrong';

      if (status === 400) {
        throw `Bad Request. ${message}`;
      } else if (status === 401) {
        throw 'Invalid or expired token';
      } else if (status === 404) {
        throw `${message}`;
      } else {
        throw 'Internal Server error. Please try again later.';
      }
    } else {
      throw 'Network error. Please check your connection';
    }
  }
};

export const resendtRegistrationEmail = async (
  resendtRegistrationEmailForm: RequestResetPasswordForm
) => {
  try {
    const response = await userAPI.post(
      `/request/resend_registration_email`,
      resendtRegistrationEmailForm
    );
    console.log('POST resend registration email', response.data);
    return response.data;
  } catch (error) {
    console.error('POST resend registration email', error);
    throw error;
  }
};
