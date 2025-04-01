import { useViewAccount } from "@/hooks/admin/useViewAccount";
import { TabsContent } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountInfoTab: React.FC = () => {
  const { accountInfo } = useViewAccount();
  
  return (
    <>
      <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                {accountInfo?.email}
              </div>
            </CardContent>
          </Card>
    </>
  );
};

export default AccountInfoTab;
