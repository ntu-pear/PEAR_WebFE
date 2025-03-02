import { Button } from '../ui/button';
import { useModal } from '@/hooks/useModal';

const RegisterExistingGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <div className="p-4">
          <h3>
            Find an existing guardian
          </h3>
          <div className='mt-5 flex justify-end'>
            <Button
              className='bg-red-500 mr-1'
              onClick={() => {
                closeModal()
              }}
            >
              Yes
            </Button>
            <Button
              className='bg-blue-500'
              onClick={() => closeModal()}
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterExistingGuardianModal;
