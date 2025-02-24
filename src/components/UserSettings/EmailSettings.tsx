import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  getUserDetails,
  sendNewEmailConfirmation,
  UserEmail,
} from "@/api/users/user";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const EmailSettings: React.FC = () => {
  const [UserEmail, setUserEmail] = useState<UserEmail | null>(null);
  const newEmailRef = useRef<HTMLInputElement>(null);

  const fetchUserEmail = async () => {
    const data: UserEmail = await getUserDetails();
    setUserEmail(data);
  };

  const handleOnInputChange = () => {
    if (newEmailRef.current) {
      newEmailRef.current.setCustomValidity("");
    }
  };

  const handleSendConfirmationEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const newEmail = newEmailRef.current?.value.trim().toLowerCase() as string;

    if (!UserEmail || !UserEmail.email) {
      toast.error("Failed to retrieve current email.");
      return;
    }

    if (newEmail === UserEmail.email.toLowerCase()) {
      newEmailRef.current?.setCustomValidity(
        "The new email cannot be the same as the current email."
      );
      newEmailRef.current?.reportValidity();
      return;
    }

    const newEmailFormData = {
      email: newEmail,
    };

    try {
      await sendNewEmailConfirmation(newEmailFormData);
      toast.success("Confirmation email have been sent to new email.");
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(`Failed to send confirmation email to new email. ${error}`);
    }
  };

  useEffect(() => {
    fetchUserEmail();
  }, []);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Email</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-24">
            <div className="w-full sm:w-4/5 md:w-4/5 lg:w-4/5 xl:w-3/5 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-6 w-full">
                  <input
                    id="email"
                    type="email"
                    value={UserEmail?.email || ""}
                    className="w-full block p-2 border rounded-md bg-gray-100 text-gray-900"
                    readOnly
                  />
                </div>
              </div>
              <form id="newEmailForm" onSubmit={handleSendConfirmationEmail}>
                <div className="space-y-2">
                  <Label htmlFor="new-email">
                    New Email <span className="text-red-600"> *</span>
                  </Label>
                  <div className="flex gap-6 w-full">
                    <input
                      id="newEmail"
                      name="newEmail"
                      type="email"
                      className="w-full block p-2 border rounded-md text-gray-900"
                      ref={newEmailRef}
                      onChange={handleOnInputChange}
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div>
            <Button type="submit" form="newEmailForm">
              Send confirmation Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
