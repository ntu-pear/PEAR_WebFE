import React from 'react';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  confirmAction: (() => void) | null;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  message,
  confirmAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="flex items-center gap-2 text-xl font-semibold"><TriangleAlert /> Confirm Action</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-md">
            <span className="sr-only">Close</span>
            <span className="text-xl">&times;</span>
          </Button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={onClose} className="rounded-md">Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirmAction) confirmAction();
              onClose();
            }}
            className="rounded-md"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
