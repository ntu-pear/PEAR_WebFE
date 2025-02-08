import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';

const ConfirmProfilePhotoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { tempPhoto, refreshProfileData } = activeModal.props as {
    tempPhoto: string;
    refreshProfileData: () => void;
  };

  const handleConfirmProfilePhoto = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Profile Photo Set!', tempPhoto);
    refreshProfileData();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[500px]">
        <h3 className="text-lg font-medium mb-1">Confirm Profile Photo </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-200 mb-5">
          Is this the photo you want to use for your profile photo?
        </p>
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={handleConfirmProfilePhoto}
        >
          <div className="flex justify-center col-span-1">
            <Avatar className="h-52 w-52">
              <AvatarImage
                src={tempPhoto || 'https://github.com/shadcn.png'}
                alt="Profile"
              />
              <AvatarFallback>
                <p className="text-5xl">CN</p>
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="col-span-1 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Confirm</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmProfilePhotoModal;
