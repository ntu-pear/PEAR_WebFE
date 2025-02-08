import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { useModal } from '@/hooks/useModal';
import VerifyEmailModal from '../Modal/VerifyEmailModal';
import { useState } from 'react';

const TwoFactorAuthSettings: React.FC = () => {
  const { activeModal, openModal } = useModal();
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSwitchChange = (checked: boolean) => {
    setIsSwitchOn(checked);
    if (checked) {
      openModal('verifyEmail');
    }
  };

  const handleCancelClick = () => {
    setIsSwitchOn(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Two-factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Card className="w-full md:w-3/4 lg:w-1/2 mt-2 mb-2">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="email2FASwitch"
                      className="text-base font-medium"
                    >
                      Enable Email 2FA
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive OTP via email
                    </p>
                  </div>
                  <Switch
                    id="email2FASwitch"
                    checked={isSwitchOn} // Bind the state to the switch
                    onCheckedChange={handleSwitchChange} // Handle the change
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      {activeModal.name === 'verifyEmail' && (
        <VerifyEmailModal onCancelClick={handleCancelClick} />
      )}
    </>
  );
};

export default TwoFactorAuthSettings;
