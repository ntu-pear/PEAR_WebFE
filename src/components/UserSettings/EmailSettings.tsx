import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const EmailSettings: React.FC = () => {
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
                  <Input id="email" type="email" />
                  <Button
                    type="submit"
                    className="invisible pointer-events-none"
                  >
                    Verify Email
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">New Email</Label>
                <div className="flex gap-6 w-full">
                  <Input id="new-email" type="email" />
                  <Button type="submit">Verify Email</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-otp">Email OTP</Label>
                <Input id="email-otp" type="text" className="w-1/2-full" />
              </div>
            </div>
          </div>

          <div>
            <Button type="submit">Update Email</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
