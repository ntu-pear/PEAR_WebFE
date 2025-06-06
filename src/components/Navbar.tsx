import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell, UserRound } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
// import Sidebar from '@/components/Sidebar';
import SidebarMenu from "@/components/Sidebar/SidebarMenu";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { useUserProfile } from "@/hooks/user/useUserProfile";
import { toast } from "sonner";
import { formatRoleName } from "@/utils/formatRoleName";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const initialNotifications = [
    {
      id: 1,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
      name: "Sara Salah",
      action: "replied on the",
      target: "Upload Image",
      time: "2m",
    },
    {
      id: 2,
      avatar:
        "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
      name: "Slick Net",
      action: "started following you",
      time: "45m",
    },
    {
      id: 3,
      avatar:
        "https://images.unsplash.com/photo-1450297350677-623de575f31c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
      name: "Jane Doe",
      action: "liked your reply on",
      target: "Test with TDD",
      time: "1h",
    },
    {
      id: 4,
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=398&q=80",
      name: "Abigail Bennett",
      action: "started following you",
      time: "3h",
    },
  ];

  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const { currentUser, logout } = useAuth();
  const { profilePhoto, userDetails } = useUserProfile();

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleUserSettings = () => {
    const settingsBaseLink = (() => {
      if (!currentUser?.roleName) return "/login";
      const formattedRoleName = formatRoleName(currentUser.roleName);

      switch (currentUser.roleName) {
        case "ADMIN":
          return "/admin/settings/profile";
        case "SUPERVISOR":
          return "/supervisor/settings/profile";
        case "DOCTOR":
          return "/doctor/settings/profile";
        case "GAME THERAPIST":
          return "/game-therapist/settings/profile";
        case "GUARDIAN":
          return "/guardian/settings/profile";
        default:
          return `/${formattedRoleName}/settings/profile`; //lowercase then replace space with -
      }
    })();

    navigate(settingsBaseLink, { replace: true });
  };

  const handleLogout = () => {
    toast.dismiss();
    logout();
  };

  const linkPath = (() => {
    if (!currentUser?.roleName) return "/login";
    const formattedRoleName = formatRoleName(currentUser.roleName);

    switch (currentUser.roleName) {
      case "ADMIN":
        return "/admin/manage-accounts";
      case "SUPERVISOR":
        return "/supervisor/manage-patients";
      case "DOCTOR":
        // return "/doctor/temp-page";
        return "/doctor/manage-patients";
      case "GAME THERAPIST":
        return "/game-therapist/temp-page";
      case "GUARDIAN":
        return "/guardian/temp-page";
      default:
        return `/${formattedRoleName}/temp-page`;
    }
  })();

  return (
    <>
      <nav className="bg-background border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left-aligned content */}
            <div className="flex items-center">
              <SidebarMenu />
              {/* <Sidebar /> */}
              <Link to={linkPath} className="flex-shrink-0 ml-4">
                <img className="h-12 w-24" src="/pear.png" alt="Pear Logo" />
              </Link>
            </div>

            {/* Right-aligned content */}
            <div className="flex items-center space-x-4">
              {/* Notification dropdown button */}
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={toggleDropdown}>
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                {dropdownOpen && (
                  <>
                    <div
                      onClick={() => setDropdownOpen(false)}
                      className="fixed inset-0 h-full w-full z-10"
                    ></div>

                    {/* Dropdown menu */}
                    <div
                      className="fixed right-2 mt-2 rounded-md overflow-hidden z-50 bg-background border-b"
                      style={{ width: "20rem" }}
                    >
                      <div className="py-2">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <a
                              key={notification.id}
                              href="#"
                              className="flex items-center px-4 py-3 border-b hover:bg-slate-100 -mx-2"
                            >
                              <img
                                className="h-8 w-8 rounded-full object-cover mx-1"
                                src={notification.avatar}
                                alt="avatar"
                              />
                              <p className="text-gray-600 text-sm mx-2 text-primary hover:text-black">
                                <span className="font-bold">
                                  {notification.name}
                                </span>{" "}
                                {notification.action}{" "}
                                {notification.target && (
                                  <span className="font-bold text-blue-500">
                                    {notification.target}
                                  </span>
                                )}{" "}
                                . {notification.time}
                              </p>
                            </a>
                          ))
                        ) : (
                          <p className="text-gray-600 text-center py-4 text-primary">
                            No notifications
                          </p>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="block w-full bg-gray-800 text-white text-center font-bold py-2 hover:bg-gray-700"
                        >
                          Clear all notifications
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Theme toggle button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profilePhoto || ""} alt="Profile" />
                      <AvatarFallback>
                        {" "}
                        <UserRound className="w-48 h-48 text-gray-500" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userDetails?.preferredName || userDetails?.nric_FullName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleUserSettings}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
