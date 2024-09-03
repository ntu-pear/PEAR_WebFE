// components/Modal.tsx
import React from "react";

interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  name: string; // Full name
  preferredName: string; // Preferred name
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  open,
  onClose,
  imageUrl,
  name,
  preferredName,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img src={imageUrl} alt={name} className="modal-image" />
        <div className="modal-name">
          <div className="modal-full-name">{name}</div>
          <div className="modal-preferred-name">{preferredName}</div>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
