import axios from "axios";
import { getDoctorNameAPI, userAPI, usersAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "./auth";

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

export interface UserDetails {
  id: string;
  preferredName: string | null;
  nric_FullName: string;
  nric: string;
  nric_Address: string;
  nric_DateOfBirth: string;
  nric_Gender: string;
  roleName: string;
  contactNo: string | null;
  allowNotification: boolean;
  profilePicture: string | null;
  lockoutReason: string | null;
  status: string;
  email: string;
  emailConfirmed: boolean;
  verified: boolean;
  active: boolean;
  twoFactorEnabled: boolean;
  createdById: string;
  createdDate: string;
  modifiedById: string;
  modifiedDate: string;
}

export interface UserProfile {
  nric_FullName: string;
  preferredName: string | null;
  contactNo: string | null;
}

export interface UserProfileForm {
  preferredName: string | null;
  contactNo: string;
}

export interface UserNewEmail {
  email: string;
}

export interface UserEmail {
  email: string;
  emailConfirmed: boolean;
}

export interface UserPasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyUserForm {
  nric_FullName: string;
  nric_Address: string;
  nric_DateOfBirth: string;
  nric_Gender: string;
  contactNo: string | null;
  email: string;
  roleName: string;
  nric: string;
  password: string;
  confirm_Password: string;
}

export const verifyUser = async (user: VerifyUserForm, UrlToken: string) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("Token not found");
    const response = await userAPI.post(
      `/verify_account/${UrlToken}`,
      { ...user },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Verify user", response.data);
    return response.data;
  } catch (error) {
    console.error("Verify user", error);
    throw error;
  }
}

export const requestResetPassword = async (
  requestResetPasswordForm: RequestResetPasswordForm
) => {
  try {
    const response = await userAPI.post(
      `/request_reset_password/`,
      requestResetPasswordForm
    );
    console.log("POST request reset password", response.data);
    return response.data;
  } catch (error) {
    console.error("POST request reset password", error);
    throw error;
  }
};

export const resetPassword = async (
  resetPasswordForm: ResetPasswordForm,
  token: string
) => {
  try {
    const response = await userAPI.put(
      `/reset_user_password/${token}`,
      resetPasswordForm
    );
    console.log("POST reset password", response.data);
    return response.data;
  } catch (error) {
    console.error("POST reset password", error);

    if (axios.isAxiosError(error)) {
      // Extract error response if available
      const status = error.response?.status;
      const message = error.response?.data?.message || "Something went wrong";

      if (status === 400) {
        throw `Bad Request. ${message}`;
      } else if (status === 401) {
        throw "Invalid or expired token";
      } else if (status === 404) {
        throw `${message}`;
      } else {
        throw "Internal Server error. Please try again later.";
      }
    } else {
      throw "Network error. Please check your connection";
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
    console.log("POST resend registration email", response.data);
    return response.data;
  } catch (error) {
    console.error("POST resend registration email", error);
    throw error;
  }
};

export const sendNewEmailConfirmation = async (formData: UserNewEmail) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await userAPI.put<UserDetails>(`/update_user/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PUT send new email confirimation", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT send new email confirimation", error);
    if (axios.isAxiosError(error)) {
      // Extract error response if available
      const status = error.response?.status;
      const message = error.response?.data?.message || "Something went wrong.";

      if (status === 401) {
        throw "Invalid or expired token.";
      } else if (status === 404) {
        throw `Email not found.`;
      } else if (status === 400) {
        throw `${message}`;
      } else {
        throw "Internal Server error. Please try again later.";
      }
    } else {
      throw "Network error. Please check your connection.";
    }
  }
};

export const confirmNewEmail = async (token: string) => {
  try {
    const response = await userAPI.put(`/confirm_email/${token}`);
    console.log("PUT confirm new email", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT confirm new email", error);

    if (axios.isAxiosError(error)) {
      // Extract error response if available
      const status = error.response?.status;
      const message = error.response?.data?.message || "Something went wrong.";

      if (status === 401) {
        throw "Invalid or expired token.";
      } else if (status === 400 || status === 404) {
        throw `${message}`;
      } else {
        throw "Internal Server error. Please try again later.";
      }
    } else {
      throw "Network error. Please check your connection.";
    }
  }
};

export const changePassword = async (formData: UserPasswordForm) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    const response = await userAPI.put(`/change_password/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("PUT change password", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT change password", error);
    throw error;
  }
};

export const getUserDetails = async (): Promise<UserDetails> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await userAPI.get<UserDetails>(`/get_user/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET get user", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get user", error);
    throw error;
  }
};

export const updateUserProfile = async (userProfileForm: UserProfileForm) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await userAPI.put<UserDetails>(
      `/update_user/`,
      userProfileForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PUT update user profile", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update user profile", error);
    throw error;
  }
};

export const updateUser2FA = async (checked: boolean) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await userAPI.put<UserDetails>(
      `/update_user/`,
      {
        twoFactorEnabled: checked,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("PUT update user 2fa", response.data);
    return response.data;
  } catch (error) {
    console.error("PUT update user 2fa", error);
    throw error;
  }
};

export const fetchUserProfilePhoto = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await usersAPI.get(`/profile_pic/?token=${token}`);

    console.log("GET fetch user profile photo", response.data);
    return response?.data?.image_url;
  } catch (error) {
    console.error("GET fetch user profile photo", error);
    throw error;
  }
};

export const updateUserProfilePhoto = async (formData: FormData) => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await usersAPI.post(
      `/upload_profile_pic/?token=${token}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("POST update user profile photo", response.data);
    return response.data;
  } catch (error) {
    console.error("POST update user profile photo", error);
    throw error;
  }
};

export const deleteUserProfilePhoto = async () => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await usersAPI.delete(
      `/delete_profile_pic/?token=${token}`
    );

    console.log("DELETE delete user profile photo", response.data);
    return response.data;
  } catch (error) {
    console.error("DELETE delete user profile photo", error);
    throw error;
  }
};

export const getDoctorNameById = async (userId: string): Promise<string> => {
  try {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");

    const response = await getDoctorNameAPI.post(
      `?userId=${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("GET get doctor name by id", response.data);
    return response.data;
  } catch (error) {
    console.error("GET get doctor name by id", error);
    throw error;
  }
};
