import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useModal } from "@/hooks/useModal";
// import { useAuth } from "@/hooks/useAuth";
import { useViewAccount } from "@/hooks/admin/useViewAccount";

const ViewAccount: React.FC = () => {
  // const navigate = useNavigate();
  // const location = useLocation();

  // const { currentUser } = useAuth();
  const { accountInfo } = useViewAccount();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
        <div className="container mx-auto p-4">
          <div className="flex items-center space-x-6 mb-8 sm:pl-14">
            <div className="relative inline-block group">
              <Avatar className="h-36 w-36">
                <AvatarImage
                  src={accountInfo?.profilePicture}
                  alt={accountInfo?.nric_FullName}
                />
                <AvatarFallback>
                  <p className="text-5xl">
                    {accountInfo?.nric_FullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </p>
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {accountInfo?.nric_FullName}
              </h1>
              <p className="text-gray-600">{accountInfo?.roleName}</p>
              <p className="text-gray-600">{accountInfo?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewAccount;
