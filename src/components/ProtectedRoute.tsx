import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import { fetchUserProfilePhoto } from '@/api/users/user';
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
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const handleFetchProfilePhoto = async () => {
    setIsProfileLoading(true);
    try {
      const photoURL = await fetchUserProfilePhoto();
      setProfilePhoto(photoURL);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setProfilePhoto(null);
      console.log('Failed to fetch user profile photo.');
    }
    setIsProfileLoading(false);
  };

  const refreshProfile = async () => {
    handleFetchProfilePhoto();
  };

  useEffect(() => {
    if (currentUser) {
      refreshProfile(); // Fetch the profile when the user is available
    }
  }, [currentUser]);

  if (isLoading || isProfileLoading) {
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
    <UserProfileContext.Provider value={{ profilePhoto, refreshProfile }}>
      <Navbar />
      <Outlet />
    </UserProfileContext.Provider>
  );
};

export default ProtectedRoute;
