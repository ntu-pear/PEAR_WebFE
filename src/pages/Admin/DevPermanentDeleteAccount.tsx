import React, { useState, useRef } from "react";
import { Trash2, AlertTriangle, User } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  fetchUserById,
  permanentDeleteUserById,
  User as UserType,
} from "@/api/admin/user";

// Utility functions to format dates consistently
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const formatDateOnly = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const DevPermanentDelete: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const confirmTextRequired = "DELETE";

  const handleFetchUser = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a valid user ID");
      return;
    }

    setIsLoading(true);
    try {
      const user = await fetchUserById(userId.trim());
      setUserInfo(user);
      toast.success("User information loaded");
    } catch (error) {
      toast.error("Failed to fetch user information");
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo) return;

    if (confirmText !== confirmTextRequired) {
      toast.error(`Please type '${confirmTextRequired}' to confirm`);
      return;
    }

    setIsDeleting(true);
    try {
      await permanentDeleteUserById(userInfo.id);
      toast.success(
        `User ${userInfo.nric_FullName} has been permanently deleted`
      );
      setUserInfo(null);
      setUserId("");
      setConfirmText("");
      setShowConfirmModal(false);
    } catch (error) {
      toast.error("Failed to permanently delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Permanent Account Deletion</h1>
          <p className="text-muted-foreground">
            Developer tool for permanently deleting user accounts.
          </p>
        </div>

        {/* Warning Alert */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            This action permanently deletes the user account.
          </AlertDescription>
        </Alert>

        {/* User ID Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Find User to Delete
            </CardTitle>
            <CardDescription>
              Enter the user ID to look up user information before deletion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter user ID..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchUser()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleFetchUser}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? "Loading..." : "Fetch User"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information Display */}
        {userInfo && (
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Preferred Name
                  </Label>
                  <p className="text-sm font-medium">
                    {userInfo.preferredName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Full Name (NRIC)
                  </Label>
                  <p className="text-sm font-medium">
                    {userInfo.nric_FullName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="text-sm font-medium">{userInfo.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <div>
                    <Badge variant="outline">{userInfo.roleName}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </Label>
                  <p className="text-sm font-medium">{userInfo.contactNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </Label>
                  <p className="text-sm font-medium">
                    {userInfo.nric_DateOfBirth
                      ? formatDateOnly(userInfo.nric_DateOfBirth)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </Label>
                  <p className="text-sm font-medium">
                    {formatDateTime(userInfo.createdDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={userInfo.isDeleted ? "destructive" : "default"}
                    >
                      {userInfo.isDeleted ? "Soft Deleted" : "Active"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Modified
                  </Label>
                  <p className="text-sm font-medium">
                    {formatDateTime(userInfo.modifiedDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </Label>
                  <p className="text-sm font-medium">
                    {userInfo.loginTimeStamp
                      ? formatDateTime(userInfo.loginTimeStamp)
                      : "Never"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Permanent Delete Button */}
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete User
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && userInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="bg-background rounded-md w-[600px] max-h-[80vh] overflow-y-auto mx-4"
          >
            <div className="bg-red-600 p-4">
              <h3 className="text-lg font-medium text-white">
                Confirm Permanent Deletion
              </h3>
            </div>

            <form onSubmit={handlePermanentDelete} className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-200">
                  You are about to permanently delete the account for{" "}
                  <strong>{userInfo.nric_FullName}</strong> ({userInfo.email}).
                  This action cannot be undone.
                </p>
              </div>

              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  This will permanently remove the user profile from the system.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-text">
                  Type "{confirmTextRequired}" to confirm
                </Label>
                <Input
                  id="confirm-text"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmTextRequired}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleting || confirmText !== confirmTextRequired}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevPermanentDelete;
