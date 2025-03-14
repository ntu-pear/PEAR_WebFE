import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Camera, Trash2 } from "lucide-react";

interface ProfilePhotoSetProps {
  profilePhotoFile: File | null;
  setProfilePhotoFile: (file: File | null) => void;
}

const ProfilePhotoSet: React.FC<ProfilePhotoSetProps> = ({
  profilePhotoFile,
  setProfilePhotoFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Check if the file is an image type (jpg, jpeg, png)
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPG, JPEG, or PNG file.");
        return;
      }

      if (file.size >= 2_000_000) {
        setError(
          "The file is too large. Please upload a file no more than 2MB."
        );
        return;
      }

      // Rename the file
      const renamedFile = new File(
        [file],
        `profile_picture.${file.type.split("/")[1]}`,
        {
          type: file.type,
        }
      );

      setError(""); // Clear error if validation passes
      setProfilePhotoFile(renamedFile);
    }
  };

  const handleClearPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError("");
    setProfilePhotoFile(null);
  };

  useEffect(() => {
    if (profilePhotoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoURL(reader.result as string); // Set the base64 data URL upon loadend
      };
      reader.readAsDataURL(profilePhotoFile); // Convert file to base64
    } else {
      setProfilePhotoURL(null); // Reset if no file is present
    }
  }, [profilePhotoFile]);

  return (
    <div className="flex items-center space-x-6">
      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
        {profilePhotoFile ? (
          <img
            src={profilePhotoURL || ""}
            alt="Profile photo preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-16 w-16 text-gray-400" />
        )}
      </div>

      <div className="space-y-3 w-full max-w-[150px] sm:max-w-[200px]">
        <input
          type="file"
          id="profile-picture"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4 mr-2" />
          {profilePhotoFile ? "Change Photo" : "Add Photo"}
        </Button>

        {profilePhotoFile && (
          <Button
            type="button"
            variant="outline"
            className="w-full text-red-500 hover:text-red-700 border-red-200 hover:border-red-700"
            onClick={handleClearPhoto}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Photo
          </Button>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ProfilePhotoSet;
