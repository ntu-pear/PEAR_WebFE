import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

const ProfilePhotoInputModal: React.FC = () => {
  const { modalRef, openModal, closeModal } = useModal();
  const [error, setError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if the file is an image type (jpg, jpeg, png)
      const validTypes = ["image/jpeg" /*'image/png'*/];
      if (!validTypes.includes(file.type)) {
        // setError('Please upload a JPG, JPEG, or PNG file.');
        setError("Please upload a JPG or JPEG file.");
        return;
      }

      // Check if the file size is under 2MB (2MB = 2,000,000 bytes)
      if (file.size >= 2_000_000) {
        setError(
          "The file is too large. Please upload a file no more than 2MB."
        );
        return;
      }
      setError("");

      const reader = new FileReader();
      reader.onload = () => {
        closeModal();
        openModal("confirmProfilePhoto", {
          tempPhoto: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-1">Upload Profile Photo </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-200 mb-5">
          Select a profile photo to upload.
        </p>
        <form className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            ></Input>
          </div>
          {error && <div className="col-span-2 text-red-600 mb-2">{error}</div>}
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePhotoInputModal;
