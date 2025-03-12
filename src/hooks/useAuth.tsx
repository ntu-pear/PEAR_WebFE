import { addAuthInterceptor } from "@/api/interceptors";
import {
  CurrentUser,
  getCurrentUser,
  refreshAccessToken,
  retrieveAccessTokenExpiryFromCookie,
  retrieveAccessTokenFromCookie,
  sendLogin,
  sendLogin2FA,
  sendLogout,
} from "@/api/users/auth";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { AlertTriangle } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
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
  const expiryTimeout = useRef<NodeJS.Timeout | null>(null);

  const login = async (formData: FormData) => {
    try {
      const loginResponse = await sendLogin(formData);

      addAuthInterceptor();

      if ("access_token" in loginResponse) {
        const response = await getCurrentUser();
        setCurrentUser(response);

        toast.dismiss();
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

      const response = await getCurrentUser();
      console.log(response);

      setCurrentUser(response);

      toast.dismiss();
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

  const checkAccessTokenExpiry = () => {
    const expiresAt = retrieveAccessTokenExpiryFromCookie();
    if (!expiresAt) {
      return;
    }

    const expiryTime = dayjs.utc(expiresAt);
    const timeLeft = expiryTime.diff(dayjs.utc());

    // Clear previous timeout if exists
    if (expiryTimeout.current !== null) {
      clearTimeout(expiryTimeout.current);
    }
    if (timeLeft > 60000 && timeLeft < 300000) {
      //if (timeLeft > 60000) {
      toast.dismiss();
      toast.warning(
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <p className="text-sm font-medium">
              Your session is about to expire soon. Do you want to extend your
              session?
            </p>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              size="sm"
              onClick={async () => {
                toast.dismiss();
                try {
                  await refreshAccessToken();
                  toast.success("Session extended.");

                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                  toast.error("Failed to extend session. Logging out");
                  await logout();
                }
              }}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                toast.dismiss();
                await logout();
              }}
            >
              Logout
            </Button>
          </div>
        </div>,
        { duration: timeLeft }
      );
      // else if more than 5mins, schedule the toast
    } else if (timeLeft >= 300000) {
      const timeoutId = setTimeout(checkAccessTokenExpiry, timeLeft - 300000); // Set timeout for 5 minutes before expiry
      expiryTimeout.current = timeoutId;
    }
  };

  useEffect(() => {
    const token = retrieveAccessTokenFromCookie();
    if (token && !currentUser) {
      fetchUser();
    } else if (currentUser) {
      // If user is authenticated, start checking for access token expiry
      checkAccessTokenExpiry();
    }

    // Cleanup timeout when currentUser changes or on unmount
    return () => {
      if (expiryTimeout.current !== null) {
        clearTimeout(expiryTimeout.current);
      }
    };
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
