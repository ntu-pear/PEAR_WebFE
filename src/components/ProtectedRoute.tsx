import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import { fetchUserProfilePhoto } from '@/api/users/user';
import { useEffect, useState } from 'react';
import { UserProfileContext } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const handleFetchProfilePhoto = async () => {
    try {
      const photoURL = await fetchUserProfilePhoto();
      setProfilePhoto(photoURL);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch user profile photo.');
    }
  };

  const refreshProfile = async () => {
    handleFetchProfilePhoto();
  };

  useEffect(() => {
    if (currentUser) {
      refreshProfile(); // Fetch the profile when the user is available
    }
  }, [currentUser]);

  if (isLoading) {
    return <div>Loading...</div>; // or your preferred loading indicator
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
