import axios from 'axios';
import { userAPI, usersAPI } from '../apiConfig';
import { retrieveTokenFromCookie } from './auth';

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

export const resendRegistrationEmail = async (
  resendRegistrationEmailForm: RequestResetPasswordForm
) => {
  try {
    const response = await userAPI.post(
      `/request/resend_registration_email`,
      resendRegistrationEmailForm
    );
    console.log('POST resend registration email', response.data);
    return response.data;
  } catch (error) {
    console.error('POST resend registration email', error);
    throw error;
  }
};

// export const fetchUserProfilePhoto = async () => {
//   try {
//     const token = retrieveTokenFromCookie();
//     if (!token) throw new Error('No token found.');

//     const response = await usersAPI.get('/profile_pic/', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     console.log('GET fetch user profile photo', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('GET fetch user profile photo', error);
//     throw error;
//   }
// };
