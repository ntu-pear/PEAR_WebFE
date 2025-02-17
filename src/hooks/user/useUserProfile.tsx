import { UserDetails } from '@/api/users/user';
import { createContext, useContext } from 'react';

interface UserProfileContextType {
  profilePhoto: string | null;
  userDetails: UserDetails | null;
  refreshProfilePhoto: () => void;
  refreshUserDetails: () => void;
}

export const UserProfileContext = createContext<
  UserProfileContextType | undefined
>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
