import useDeleteRole from '@/hooks/user/useDeleteRole';
import { Button } from '../ui/button';
import { useModal } from '@/hooks/useModal';

const DeleteRoleModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { role } = activeModal.props as {
    role: { id: string, name: string };
  };
  const { mutate } = useDeleteRole()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <div className="p-4">
          <h3>
            Are you sure you want to delete {role.name} role?
          </h3>
          <div className='mt-5 flex justify-end'>
            <Button
              className='bg-red-500 mr-1'
              onClick={() => mutate(role.id)}
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

export default DeleteRoleModal;
