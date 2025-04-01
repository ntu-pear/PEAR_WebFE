import { useViewAccount } from "@/hooks/admin/useViewAccount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountInfoTab: React.FC = () => {
  const { accountInfo } = useViewAccount();

  return (
    <>
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
            <p className="text-sm font-medium">Address</p>
            {accountInfo?.nric_Address || "NA"}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AccountInfoTab;
