import { EyeIcon, EyeOffIcon, Info } from "lucide-react";
import { useViewAccount } from "@/hooks/admin/useViewAccount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const AccountInfoTab: React.FC = () => {
  const {
    accountInfo,
    createdByAccount,
    nricData,
    modifiedByAccount,
    getNRIC,
    handleNRICToggle,
  } = useViewAccount();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">NRIC Full Name</p>
            <p id="accountinfo-nric-fullname">{accountInfo?.nric_FullName || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferred Name</p>
            <p id="accountinfo-preferred-name">{accountInfo?.preferredName || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">NRIC</p>
            <div className="flex">
              <p id="accountinfo-nric">{getNRIC() || "NA"}</p>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleNRICToggle}
                className="h-6 w-6 flex items-center justify-center ml-1"
              >
                {nricData.isMasked ? (
                  <EyeOffIcon className="h-5 w-5" /> // Masked
                ) : (
                  <EyeIcon className="h-5 w-5" /> // Unmasked
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Gender</p>
            <p id="accountinfo-gender">{accountInfo?.nric_Gender || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Contact No</p>
            <p id="accountinfo-contact-no">{accountInfo?.contactNo || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Date of Birth</p>
            <p id="accountinfo-dob">{accountInfo?.nric_DateOfBirth || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Email</p>
            <p id="accountinfo-email">{accountInfo?.email || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Email Confirmed</p>
            <p id="accountinfo-email-confirmed">{accountInfo?.emailConfirmed ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Notifications Allowed</p>
            <p id="accountinfo-notifications-allowed">{accountInfo?.allowNotification ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">NRIC Address</p>
            <p id="accountinfo-nric-address">{accountInfo?.nric_Address || "NA"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Account Status</p>
            <p id="accountinfo-status">{accountInfo?.isDeleted ? "Inactive" : "Active"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium">Account Verified</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-blue-500"/></TooltipTrigger>
                  <TooltipContent>
                    Indicates whether the account has been verified.
                  </TooltipContent>
                </Tooltip>
                </TooltipProvider> 
            </div>
            <p id="accountinfo-verified">{accountInfo?.verified ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Account ID</p>
            <p id="accountinfo-id">{accountInfo?.id || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <p id="accountinfo-role">{accountInfo?.roleName || "NA"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium">Lockout Enabled</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-blue-500"/></TooltipTrigger>
                  <TooltipContent>
                    Indicates whether the account has been temporarily disabled.
                  </TooltipContent>
                </Tooltip>
                </TooltipProvider> 
            </div>
            <p id="accountinfo-lockout-enabled">{accountInfo?.lockOutEnabled ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium">Lockout Reason</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-blue-500"/></TooltipTrigger>
                  <TooltipContent>
                    Reason for temporarily disabling the account.
                  </TooltipContent>
                </Tooltip>
                </TooltipProvider> 
            </div>
            <p id="accountinfo-lockout-reason">{accountInfo?.lockOutReason || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Two Factor Enabled</p>
            <p id="accountinfo-2fa">{accountInfo?.twoFactorEnabled ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Login Timestamp</p>
            <p id="accountinfo-login-timestamp">{accountInfo?.loginTimeStamp || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Created By</p>
            <p id="accountinfo-created-by">
              {createdByAccount
                ? `${createdByAccount.nric_FullName} (Account ID: ${createdByAccount.id})`
                : `${"Account ID: " + accountInfo?.createdById || "NA"}`}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Created Date</p>
            <p id="accountinfo-created-date">{accountInfo?.createdDate || "NA"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Modified By</p>
            <p id="accountinfo-modified-by">
              {modifiedByAccount
                ? `${modifiedByAccount.nric_FullName} (Account ID: ${modifiedByAccount.id})`
                : `${"Account ID: " + accountInfo?.modifiedById || "NA"}`}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Modified Date</p>
            <p id="accountinfo-modified-date">{accountInfo?.modifiedDate || "NA"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountInfoTab;
