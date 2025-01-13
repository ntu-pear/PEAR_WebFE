import {
  CurrentUser,
  getCurrentUser,
  retrieveTokenFromCookie,
  sendLogin,
  sendLogout,
} from '@/api/users/auth';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (formData: FormData) => Promise<void>;
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
      await sendLogin(formData);
      const response = await getCurrentUser();
      console.log(response);
      setCurrentUser(response);
      toast.success('Login successful.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to Login. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error('Failed to Login. An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await sendLogout();
    toast.success('Logout successful.');
    navigate('/login', { replace: true });
    setIsLoading(false);
  };

  const fetchUserOnRefresh = async () => {
    try {
      const token = retrieveTokenFromCookie();
      if (!token) {
        console.log('No token found. Skipping fetch.');
        return;
      }

      const user = await getCurrentUser();
      setCurrentUser(user);
      console.log('User fetched on refresh:', user);
    } catch (error) {
      console.error('Failed to fetch user on refresh:', error);
      setCurrentUser(null);
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    fetchUserOnRefresh().finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
