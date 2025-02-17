import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';

interface VerifyEmailModalProps {
  onCancelClick: () => void;
}

const Enable2FAModal: React.FC<VerifyEmailModalProps> = ({ onCancelClick }) => {
  const { modalRef, closeModal, setOutsideClickCallback } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnableEmail2FA = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('User Email 2FA Enabled!');
      closeModal();
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setOutsideClickCallback(() => {
      onCancelClick();
    });

    return () => setOutsideClickCallback(null); // Cleanup
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[350px]">
        <h3 className="text-lg font-medium mb-5">Enable 2FA</h3>
        <form
          onSubmit={handleEnableEmail2FA}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Email OTP:<span className="text-red-600">*</span>
            </label>
            <input
              id="emailOTP"
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onCancelClick}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Enable2FAModal;
