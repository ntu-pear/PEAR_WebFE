import { useViewAccount } from "@/hooks/admin/useViewAccount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountInfoTab: React.FC = () => {
  const { accountInfo, createdByAccount, modifiedByAccount } = useViewAccount();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Full Name</p>
            {accountInfo?.nric_FullName || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferred Name</p>
            {accountInfo?.preferredName || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">NRIC</p>
            {accountInfo?.nric || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Gender</p>
            {accountInfo?.nric_Gender || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Contact No</p>
            {accountInfo?.contactNo || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Date of Birth</p>
            {accountInfo?.nric_DateOfBirth || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Email</p>
            {accountInfo?.email || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Email Confirmed</p>
            {accountInfo?.emailConfirmed ? "Yes" : "No"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Notifications Allowed</p>
            {accountInfo?.allowNotification ? "Yes" : "No"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Address</p>
            {accountInfo?.nric_Address || "NA"}
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
            {accountInfo?.isDeleted ? "Inactive" : "Active"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Account Verified</p>
            {accountInfo?.verified ? "Yes" : "No"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Account ID</p>
            {accountInfo?.id || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            {accountInfo?.roleName || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Two Factor Enabled</p>
            {accountInfo?.twoFactorEnabled ? "Yes" : "No"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Lockout Enabled</p>
            {accountInfo?.lockoutEnabled ? "Yes" : "No"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Lockout Reason</p>
            {accountInfo?.lockoutReason || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Login Timestamp</p>
            {accountInfo?.loginTimeStamp || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Created By</p>
            {createdByAccount?.nric_FullName || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Created Date</p>
            {accountInfo?.createdDate || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Modified By</p>
            {modifiedByAccount?.nric_FullName || "NA"}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Modified Date</p>
            {accountInfo?.modifiedDate || "NA"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountInfoTab;
