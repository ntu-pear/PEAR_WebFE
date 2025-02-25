import { User, Mail, Lock, File } from "lucide-react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import clsx from "clsx";

const navItems = [
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Email", icon: Mail, path: "/email" },
  { name: "Password", icon: Lock, path: "/password" },
  { name: "Two-factor Authentication", icon: Lock, path: "/two-factor-auth" },
  { name: "Personal Data", icon: File, path: "/personal-data" },
];

interface SettingsNavProps {
  basePath: string;
}

const SettingsNav: React.FC<SettingsNavProps> = ({ basePath }) => {
  const location = useLocation();

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item, i) => (
        <Link
          key={i}
          to={`${basePath}${item.path}`}
          className={clsx(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            location.pathname === `${basePath}${item.path}` &&
              "bg-accent text-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default SettingsNav;
