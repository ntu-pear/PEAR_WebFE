import { addAuthInterceptor, addUsersAPIInterceptor } from "@/api/interceptors";
import {
  CurrentUser,
  getCurrentUser,
  retrieveAccessTokenFromCookie,
  sendLogin,
  sendLogin2FA,
  sendLogout,
} from "@/api/users/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (formData: FormData) => Promise<void>;
  login2FA: (email: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const login = async (formData: FormData) => {
    try {
      const loginResponse = await sendLogin(formData);

      addAuthInterceptor();
      addUsersAPIInterceptor();

      if ("access_token" in loginResponse) {
        const response = await getCurrentUser();
        setCurrentUser(response);

        if (response?.roleName !== "CAREGIVER") {
          toast.success("Login successful.");
        }
      } else if ("msg" in loginResponse) {
        if (loginResponse.msg === "2FA required") {
          navigate("/login-2fa", { state: { email: formData.get("email") } });
          return;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to Login. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error("Failed to Login. An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login2FA = async (email: string, code: string) => {
    try {
      await sendLogin2FA(email, code);
      addAuthInterceptor();
      addUsersAPIInterceptor();

      const response = await getCurrentUser();
      console.log(response);

      setCurrentUser(response);

      if (response?.roleName !== "CAREGIVER") {
        toast.success("Login successful.");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to Login. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error("Failed to Login. An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await sendLogout();

    if (currentUser?.roleName !== "CAREGIVER") {
      toast.success("Logout successful.");
    }

    navigate("/login", { replace: true });
    setIsLoading(false);
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (user?.roleName === "CAREGIVER") {
        throw new Error("Caregiver is only available on mobile application.");
      }

      setCurrentUser(user);
      console.log("User fetched on refresh:", user);
    } catch (error) {
      console.error("Failed to fetch user on refresh:", error);
      setCurrentUser(null);
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = retrieveAccessTokenFromCookie();
    if (token && !currentUser) {
      fetchUser();
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, login2FA, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
