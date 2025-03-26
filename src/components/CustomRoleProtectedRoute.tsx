import { useParams } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const CustomRoleProtectedRoute = () => {
  const { role } = useParams<{ role: string }>(); // Get the role from the URL

  const formatRoleForComparison = (role: string) => {
    return role
      .split("-") // Split by hyphen
      .map((word) => word.toUpperCase()) // Convert all words to uppercase
      .join(" "); // Join back with spaces, so "game-designer" becomes "GAME DESIGNER"
  };
  const formattedRole = formatRoleForComparison(role || "");

  return <ProtectedRoute allowedRoles={[formattedRole]} />;
};

export default CustomRoleProtectedRoute;
