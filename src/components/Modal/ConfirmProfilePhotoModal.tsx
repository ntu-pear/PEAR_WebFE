import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Progress } from "../ui/progress";
import { updateUserProfilePhoto } from "@/api/users/user";
import { updatePatientProfilePhoto } from "@/api/patients/patients";

const ConfirmProfilePhotoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { tempPhoto, refreshProfile, isUser, patientId } =
    activeModal.props as {
      tempPhoto?: string;
      refreshProfile: () => void;
      isUser: boolean;
      patientId?: string;
    };
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const base64ToFile = (base64: string, baseFilename: string): File => {
    const [metadata, data] = base64.split(",");

    const mimeMatch = metadata.match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error(
        "Invalid base64 string, MIME type could not be determined."
      );
    }

    const mime = mimeMatch[1];
    if (!["image/jpeg", "image/png"].includes(mime)) {
      throw new Error(
        "Unsupported image format. Please upload a JPG, JPEG, or PNG image."
      );
    }

    const extension = mime === "image/png" ? "png" : "jpg"; // Determine correct extension
    const filename = `${baseFilename}.${extension}`; // Append extension

    const binary = atob(data);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new File([array], filename, { type: mime });
  };

  const handleConfirmProfilePhoto = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!tempPhoto) {
      console.log("No photo selected!");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    const file = base64ToFile(tempPhoto, "profile_picture");
    formData.append("file", file);

    const context = isUser ? "user" : "patient";

    try {
      // Simulate upload progress
      const uploadSimulation = setInterval(() => {
        setUploadProgress((prevProgress: number) => {
          const newProgress = prevProgress + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      if (isUser) {
        await updateUserProfilePhoto(formData);
      } else {
        if (!patientId || isNaN(Number(patientId))) {
          throw "Invalid patient id.";
        }
        await updatePatientProfilePhoto(Number(patientId), formData);
      }

      refreshProfile();
      clearInterval(uploadSimulation);
      setUploadProgress(100);
      closeModal();
      toast.success(`Update ${context} profile photo successfully`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();

      toast.error(`Failed to update ${context} profile photo.`);
    } finally {
      setIsLoading(false);
    }
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
              <AvatarImage src={tempPhoto || ""} alt="Profile" />
              <AvatarFallback>
                <UserRound className="w-48 h-48 text-gray-500" />
              </AvatarFallback>
            </Avatar>
          </div>

          {isLoading && (
            <div className="col-span-1 mt-6">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
              <div className="flex items-center justify-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Processing your photo...</span>
              </div>
            </div>
          )}

          {!isLoading && (
            <div className="col-span-1 mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Confirm</Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ConfirmProfilePhotoModal;
