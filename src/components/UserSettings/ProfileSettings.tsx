import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Trash2, Upload, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import UploadProfilePhotoModal from '../Modal/UploadProfilePhotoModal';
import ConfirmProfilePhotoModal from '../Modal/ConfirmProfilePhotoModal';
import DeleteProfilePhotoModal from '../Modal/DeleteProfilePhotoModel';
import { useUserProfile } from '@/hooks/useUserProfile';

const ProfileSettings: React.FC = () => {
  const { activeModal, openModal } = useModal();
  const { profilePhoto, refreshProfile } = useUserProfile();

  useEffect(() => {
    refreshProfile();
  }, []);

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
                  <Label htmlFor="name">Preferred Name</Label>
                  <Input id="name" className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-number">Contact Number</Label>
                  <Input id="contact-number" type="tel" className="w-full" />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium mb-2">Profile Photo</p>
                <div className="relative inline-block group">
                  <Avatar className="h-52 w-52">
                    <AvatarImage src={profilePhoto || ''} alt="Profile" />
                    <AvatarFallback>
                      <UserRound className="w-48 h-48 text-gray-500" />
                    </AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => openModal('uploadProfilePhoto')}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </DropdownMenuItem>
                      {profilePhoto && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openModal('deleteProfilePhoto')}
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
              <Button type="submit">Update Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeModal.name === 'uploadProfilePhoto' && <UploadProfilePhotoModal />}
      {activeModal.name === 'confirmProfilePhoto' && (
        <ConfirmProfilePhotoModal />
      )}
      {activeModal.name === 'deleteProfilePhoto' && <DeleteProfilePhotoModal />}
    </>
  );
};

export default ProfileSettings;
