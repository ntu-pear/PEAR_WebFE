import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import UploadProfilePhotoModal from "@/components/Modal/UploadProfilePhotoModal";
import EditAccountInfoModal from "@/components/Modal/Edit/EditAccountInfoModal";
import DeleteAccountModal from "@/components/Modal/Delete/DeleteAccountModal";
import { useViewAccount } from "@/hooks/admin/useViewAccount";
import AccountInfoTab from "@/components/Tab/AccountInfoTab";
import ConfirmProfilePhotoModal from "@/components/Modal/ConfirmProfilePhotoModal";
import DeleteProfilePhotoModal from "@/components/Modal/Delete/DeleteProfilePhotoModal";

const ViewAccount: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    id,
    accountInfo,
    nricData,
    getNRIC,
    setAccountInfo,
    refreshAccountData,
  } = useViewAccount();
  const { activeModal, openModal } = useModal();

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
              {currentUser?.roleName === "ADMIN" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="absolute bottom-2 left-2">
                      Edit
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onClick={() =>
                        openModal("uploadProfilePhoto", {
                          refreshProfile: refreshAccountData,
                          isUser: false,
                          patientId: id,
                        })
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </DropdownMenuItem>
                    {accountInfo?.profilePicture?.includes(
                      "https://res.cloudinary.com"
                    ) && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          openModal("deleteProfilePhoto", {
                            refreshProfile: refreshAccountData,
                            isUser: false,
                            patientId: id,
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Photo
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {accountInfo?.nric_FullName}
              </h1>
              <p className="text-gray-600">{accountInfo?.roleName}</p>
              <p className="text-gray-600">{accountInfo?.email}</p>
            </div>
            <div className="!ml-auto space-x-2">
              <Button
                variant="default"
                onClick={() =>
                  openModal("editAccountInfo", {
                    accountInfo: {
                      ...accountInfo,
                      nric: getNRIC(),
                      unmaskedNRIC: nricData.nric,
                    },
                    refreshAccountData: setAccountInfo,
                  })
                }
              >
                Edit Account
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  openModal("deleteAccount", {
                    accountId: id,
                    refreshAccountData,
                  })
                }
              >
                Delete
              </Button>
            </div>
          </div>

          <AccountInfoTab />
        </div>

        {activeModal.name === "uploadProfilePhoto" && (
          <UploadProfilePhotoModal />
        )}
        {activeModal.name === "confirmProfilePhoto" && (
          <ConfirmProfilePhotoModal />
        )}
        {activeModal.name === "deleteProfilePhoto" && (
          <DeleteProfilePhotoModal />
        )}
        {activeModal.name === "editAccountInfo" && <EditAccountInfoModal />}
        {activeModal.name === "deleteAccount" && <DeleteAccountModal />}
      </div>
    </>
  );
};

export default ViewAccount;
