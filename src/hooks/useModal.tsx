import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

interface ActiveModalType {
  name: string | null;
  props: Record<string, unknown>;
}

interface ModalContextType {
  modalRef: React.RefObject<HTMLDivElement>;
  activeModal: ActiveModalType;
  openModal: (modalName: string, modalProps?: Record<string, unknown>) => void;
  closeModal: () => void;
  setOutsideClickCallback: (callback: (() => void) | null) => void;
}

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ActiveModalType>({
    name: null,
    props: {},
  });

  // Modal ref to detect outside clicks
  const modalRef = useRef<HTMLDivElement | null>(null);

  const outsideClickCallbackRef = useRef<(() => void) | null>(null);

  const setOutsideClickCallback = (callback: (() => void) | null) => {
    outsideClickCallbackRef.current = callback;
  };

  const openModal = (
    modalName: string,
    modalProps?: Record<string, unknown>
  ) => {
    setActiveModal({ name: modalName, props: modalProps || {} });
  };
  const closeModal = () => {
    setActiveModal({ name: null, props: {} });
  };

  // Close the modal if clicking outside the modal content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        if (outsideClickCallbackRef.current) {
          outsideClickCallbackRef.current();
        }
        closeModal();
      }
    };

    if (activeModal.name) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeModal.name]);

  return (
    <ModalContext.Provider
      value={{
        modalRef,
        activeModal,
        openModal,
        closeModal,
        setOutsideClickCallback,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
