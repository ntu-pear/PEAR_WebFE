import { useModal } from "@/hooks/useModal";
import { X } from "lucide-react";

interface PatientHighlightModalProps {
  title: string;
  body: {
    label: string;
    content: string;
  }[];
  onClose: () => void;
}

const PatientHighlightModal = ({
  title,
  body,
  onClose,
}: PatientHighlightModalProps) => {
  const { modalRef, closeModal } = useModal();

  const handleClose = () => {
    closeModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="relative bg-background p-8 rounded-md w-[350px]"
      >
        <button
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-black"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-medium mb-5">{title}</h3>
        {body.map(({ label, content }) => (
          <div key={label} className="mb-2 text-sm">
            <span className="font-semibold inline-block mr-2">{label}: </span>
            <span>{content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientHighlightModal;
