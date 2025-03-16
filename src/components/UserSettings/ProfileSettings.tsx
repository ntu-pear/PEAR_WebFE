import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Trash2, Upload, UserRound } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import UploadProfilePhotoModal from "../Modal/UploadProfilePhotoModal";
import ConfirmProfilePhotoModal from "../Modal/ConfirmProfilePhotoModal";
import DeleteProfilePhotoModal from "../Modal/Delete/DeleteProfilePhotoModal";
import { useUserProfile } from "@/hooks/user/useUserProfile";
import {
  updateUserProfile,
  UserProfile,
  UserProfileForm,
} from "@/api/users/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ProfileSettings: React.FC = () => {
  const { activeModal, openModal } = useModal();
  const { profilePhoto, userDetails, refreshUserDetails, refreshProfilePhoto } =
    useUserProfile();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleUpdateUserProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const userProfileFormData: UserProfileForm = {
      preferredName: formDataObj.preferredName as string,
      contactNo: formDataObj.contactNo as string,
    };

    try {
      console.log("userProfileFormData: ", userProfileFormData);
      await updateUserProfile(userProfileFormData);
      toast.success("User profile updated successfully.");
      await refreshUserDetails();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update user profile.");
    }

    console.log("handle update user profile");
    toast.success("Update user profile successfully");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (userProfile) {
      setUserProfile({ ...userProfile, [name]: value });
    }
  };

  useEffect(() => {
    if (userDetails) {
      setUserProfile(userDetails);
    }
  }, [userDetails]);

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24 mb-10 lg:mb-auto">
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <input
                    id="nric_FullName"
                    name="nric_FullName"
                    type="text"
                    value={userProfile?.nric_FullName || ""}
                    className="block w-full p-2 border rounded-md bg-gray-100 text-gray-900"
                    readOnly
                  />
                </div>
                <form id="userProfileForm" onSubmit={handleUpdateUserProfile}>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="name">Preferred Name</Label>
                    <input
                      id="preferredName"
                      name="preferredName"
                      type="text"
                      value={userProfile?.preferredName || ""}
                      onChange={(e) => handleChange(e)}
                      className="block w-full p-2 border rounded-md text-gray-900"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="contact-number">
                      Contact Number <span className="text-red-600"> *</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="pointer-events-none">
                        <input
                          value="+65"
                          readOnly
                          className="bg-muted w-[60px] text-muted-foreground block p-2 border rounded-md text-gray-900"
                        />
                      </div>
                      <input
                        id="contactNo"
                        name="contactNo"
                        type="tel"
                        pattern="^[689]\d{7}$"
                        title="Contact Number must start with 6, 8 or 9, and be 8 digits long."
                        minLength={8}
                        maxLength={8}
                        value={userProfile?.contactNo || ""}
                        onChange={(e) => handleChange(e)}
                        className="block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium mb-2">Profile Photo</p>
                <div className="relative inline-block group">
                  <Avatar className="h-52 w-52">
                    <AvatarImage src={profilePhoto || ""} alt="Profile" />
                    <AvatarFallback>
                      <UserRound className="w-48 h-48 text-gray-500" />
                    </AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="absolute bottom-2 left-2">
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          openModal("uploadProfilePhoto", {
                            refreshProfile: refreshProfilePhoto,
                            isUser: true,
                          })
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </DropdownMenuItem>
                      {profilePhoto && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            openModal("deleteProfilePhoto", {
                              refreshProfile: refreshProfilePhoto,
                              isUser: true,
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Photo
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div>
              <Button type="submit" form="userProfileForm" className="mt-6">
                Update Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeModal.name === "uploadProfilePhoto" && <UploadProfilePhotoModal />}
      {activeModal.name === "confirmProfilePhoto" && (
        <ConfirmProfilePhotoModal />
      )}
      {activeModal.name === "deleteProfilePhoto" && <DeleteProfilePhotoModal />}
    </>
  );
};

export default ProfileSettings;
