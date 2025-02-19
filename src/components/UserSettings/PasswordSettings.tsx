import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useRef } from 'react';
import { changePassword } from '@/api/users/user';
import { toast } from 'sonner';

const PasswordSettings: React.FC = () => {
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const newPassword = newPasswordRef?.current?.value;
    const confirmPassword = confirmPasswordRef?.current?.value;
    let isValid = true;

    // Check pattern validity
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    if (newPassword && !passwordPattern.test(newPassword)) {
      newPasswordRef.current.setCustomValidity(
        'New password should have minimum of 8 characters with at least 1 uppercase, 1 lowercase and 1 special character.'
      );
      isValid = false;
    }

    // Check password match
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      confirmPasswordRef.current.setCustomValidity(
        'New password and confirm new password do not match.'
      );
      isValid = false;
    }

    if (isValid) {
      // Create a new FormData object from the event's target
      const formData = new FormData(form);

      // Convert FormData entries to an object
      const formDataObj = Object.fromEntries(formData.entries());

      const passwordFormData = {
        currentPassword: formDataObj.currentPassword as string,
        newPassword: formDataObj.newPassword as string,
        confirmPassword: formDataObj.confirmPassword as string,
      };

      console.log('passwordFormData', passwordFormData);

      try {
        await changePassword(passwordFormData);
        toast.success('User password update successfully');
        form.reset();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error(`Failed to update user password ${error}`);
      }
    } else {
      form.reportValidity();
    }
  };

  const handlePasswordInputChange = () => {
    // Clear custom validity on input change
    if (newPasswordRef.current) {
      newPasswordRef.current.setCustomValidity('');
    }
    if (confirmPasswordRef.current) {
      confirmPasswordRef.current.setCustomValidity('');
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Password</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-12">
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-24">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    Current Password <span className="text-red-600"> *</span>
                  </Label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className="w-full xl:w-4/5 block p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    New Password <span className="text-red-600"> *</span>
                  </Label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="w-full xl:w-4/5 block p-2 border rounded-md text-gray-900"
                    ref={newPasswordRef}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm New Password{' '}
                    <span className="text-red-600"> *</span>
                  </Label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="w-full xl:w-4/5 block p-2 border rounded-md text-gray-900"
                    ref={confirmPasswordRef}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Button type="submit" className="mt-8">
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordSettings;
