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

const PersonalDataSettings: React.FC = () => {
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
        <Button>Download</Button>
        <Button variant="destructive" disabled>
          Delete Account
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalDataSettings;
