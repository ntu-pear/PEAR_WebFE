import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const PasswordSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Password</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-24">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Current Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="w-full xl:w-4/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="w-full xl:w-4/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="w-full xl:w-4/5"
                />
              </div>
            </div>
          </div>

          <div>
            <Button type="submit">Update Password</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordSettings;
