import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle } from "lucide-react";
import { getUserDetails } from "@/api/users/user";
import { toast } from "sonner";

const PersonalDataSettings: React.FC = () => {
  const handleDownloadUserData = async () => {
    try {
      const jsonData = await getUserDetails();

      //Create Blob object , JSON.stringify(value, replacer, space)
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      //temporary auto download link
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "PersonalData.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to download personal data.");
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Personal Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <div className="w-3/5">
          <p className="text-muted-foreground">
            Your account contains personal data that you have given us. This
            page allows you to download or delete that data.
          </p>
        </div>

        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/10 w-3/5"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Deleting this data will permanently remove your account, and this
            cannot be recovered.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex gap-4 justify-start pt-2 pb-6">
        <Button onClick={handleDownloadUserData}>Download</Button>
        <Button variant="destructive" disabled>
          Delete Account
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalDataSettings;
