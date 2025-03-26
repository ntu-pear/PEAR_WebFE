import { useAuth } from "@/hooks/useAuth";
import SettingsNav from "../../components/UserSettings/SettingsNav";

import { Outlet } from "react-router-dom";
import { formatRoleName } from "@/utils/formatRoleName";

const UserSettings: React.FC = () => {
  const { currentUser } = useAuth();

  const basePath = (() => {
    if (!currentUser?.roleName) {
      return "/login";
    }
    const formattedRoleName = formatRoleName(currentUser.roleName);
    switch (currentUser.roleName) {
      case "ADMIN":
        return "/admin/settings";
      case "SUPERVISOR":
        return "/supervisor/settings";
      case "DOCTOR":
        return "/doctor/settings";
      case "GAME THERAPIST":
        return "/game-therapist/settings";
      case "GUARDIAN":
        return "/guardian/settings";
      default:
        return `/${formattedRoleName}/settings`; //lowercase then replace space with -
    }
  })();

  return (
    <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
      {/* Main Content */}
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">User Settings</h1>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="w-[220px]">
            <SettingsNav basePath={basePath} />
          </div>

          {/* Content Card */}
          <div className="w-md:[1080px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
