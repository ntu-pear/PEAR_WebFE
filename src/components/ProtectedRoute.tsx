import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import {
  fetchUserProfilePhoto,
  getUserDetails,
  UserDetails,
} from '@/api/users/user';
import { useEffect, useState } from 'react';
import { UserProfileContext } from '@/hooks/useUserProfile';
import { Spinner } from './ui/spinner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const refreshProfilePhoto = async () => {
    try {
      const photoURL = await fetchUserProfilePhoto();
      setProfilePhoto(photoURL);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setProfilePhoto(null);
      console.log('Failed to fetch user profile photo.');
    }
  };

  const refreshUserDetails = async () => {
    try {
      const UserDetails = await getUserDetails();
      setUserDetails(UserDetails);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUserDetails(null);
      console.log('Failed to fetch user profile details.');
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshProfilePhoto();
      refreshUserDetails(); // Fetch the profile when the user is available
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.roleName)) {
    // Redirect to an unauthorized page or home page
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <UserProfileContext.Provider
      value={{
        profilePhoto,
        userDetails,
        refreshProfilePhoto,
        refreshUserDetails,
      }}
    >
      <Navbar />
      <Outlet />
    </UserProfileContext.Provider>
  );
};

export default ProtectedRoute;
