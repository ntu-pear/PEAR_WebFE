import { PatientTableData } from '@/api/patients/patients';
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface AvatarModalWrapperProps {
  patient: PatientTableData;
}

const AvatarModalWrapper: React.FC<AvatarModalWrapperProps> = ({ patient }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedPName, setSelectedPName] = useState<string>('');

  return (
    <div>
      <Avatar>
        <AvatarImage
          src={patient.image}
          alt={patient.name}
          style={{ cursor: 'pointer' }} // Change cursor to pointer
          onClick={() => {
            setSelectedImage(patient.image || '');
            setSelectedName(patient.name);
            setSelectedPName(patient.preferredName);
            setModalOpen(true);
          }}
        />
        <AvatarFallback>
          {patient.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <AvatarModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        imageUrl={selectedImage || ''}
        name={selectedName}
        preferredName={selectedPName}
      />
    </div>
  );
};

export default AvatarModalWrapper;
