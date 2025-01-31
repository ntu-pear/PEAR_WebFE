import { useAuth } from '@/hooks/useAuth';

//temporary page displaying a simple message, for home page of roles not implemented yet.
const TempPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-12 rounded-lg shadow-lg max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Current User Role:
        </h1>
        <p className="text-xl text-center text-gray-600">
          {currentUser?.roleName || 'No Role Assigned'}
        </p>
      </div>
    </div>
  );
};

export default TempPage;
