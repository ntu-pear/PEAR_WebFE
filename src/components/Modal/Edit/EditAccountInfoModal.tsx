import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { updateUser, User } from "@/api/admin/user";
import { toast } from "sonner";
import { fetchRoleNames } from "@/api/role/roles";
import { AxiosError } from "axios";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";

// Accept accountInfo as a prop via modal props
const EditAccountInfoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { accountInfo, refreshAccountData } = activeModal.props as {
    accountInfo: User & { unmaskedNric: string };
    refreshAccountData: (updatedUser: User) => Promise<void>;
  };

  const [account, setAccount] = useState<User | null>(null);
  const [originalAccount, setOriginalAccount] = useState<
    (User & { unmaskedNric: string }) | null
  >(null);
  const [roles, setRoles] = useState<{ roleName: string }[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await fetchRoleNames();
        setRoles(rolesData || []);
      } catch {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // Initialize account and originalAccount from props, only once
  useEffect(() => {
    if (accountInfo) {
      setAccount(accountInfo);
      setOriginalAccount(accountInfo);
    }
  }, [accountInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (!account) return;
    
    // Convert name fields to uppercase automatically and filter out invalid characters
    let processedValue = value;
    if (name === "preferredName" || name === "nric_FullName") {
      // Only allow letters and spaces, remove numbers and special characters
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      processedValue = filteredValue.toUpperCase();
    }
    
    setAccount({
      ...account,
      [name]: name === "lockOutEnabled" ? processedValue === "true" : processedValue,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !originalAccount) return;

    // Validate that name fields only contain letters and spaces
    const nameRegex = /^[A-Z\s]*$/;
    
    if (account.preferredName && !nameRegex.test(account.preferredName)) {
      toast.error("Input Error: Preferred Name can only contain letters and spaces.");
      return;
    }
    
    if (account.nric_FullName && !nameRegex.test(account.nric_FullName)) {
      toast.error("Input Error: Full Name can only contain letters and spaces.");
      return;
    }

    // Validate that name fields are uppercase
    if (account.preferredName && account.preferredName !== account.preferredName.toUpperCase()) {
      toast.error("Input Error: Preferred Name must be in uppercase.");
      return;
    }
    
    if (account.nric_FullName && account.nric_FullName !== account.nric_FullName.toUpperCase()) {
      toast.error("Input Error: Full Name must be in uppercase.");
      return;
    }

    // Validate NRIC before checking for changes
    if (account.nric !== originalAccount.nric) {
      if (account.nric.includes("*")) {
        toast.error("Input Error: NRIC cannot contain * character.");
        return;
      } else if (account.nric.length !== 9) {
        toast.error("Input Error: NRIC must be 9 characters long.");
        return;
      } else if (account.nric === originalAccount.unmaskedNric) {
        toast.error(
          "Input Error: NRIC cannot be the same as unmasked NRIC."
        );
        return;
      }
    }

    const fields = [
      "preferredName",
      "contactNo",
      "email",
      "nric",
      "nric_FullName",
      "nric_Address",
      "nric_DateOfBirth",
      "nric_Gender",
      "lockOutReason",
      "lockOutEnabled",
      "lockOutEnd",
      "roleName",
    ];

    const changedFields = fields.reduce(
      (acc, field) => {
        if (
          account[field as keyof User] !== originalAccount[field as keyof User]
        ) {
          acc[field] = account[field as keyof User];
        }
        return acc;
      },
      {} as Record<string, any>
    );

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      const updatedUser = await updateUser(account.id, changedFields);
      toast.success("Account information updated successfully.");
      closeModal();
      await refreshAccountData(updatedUser);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.data.detail) {
          toast.error(
            `Error ${error.response.status}: ${error.response.data.detail}.`
          );
        } else {
          toast.error("Error: Failed to update account information.");
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-background p-8 rounded-md w-[600px] max-h-screen overflow-y-auto"
      >
        <h3 className="text-lg font-medium mb-5">Edit Account Information</h3>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Preferred Name
                <span className="text-xs text-gray-500 ml-1">(uppercase letters only)</span>
              </label>
              <input
                type="text"
                name="preferredName"
                value={account?.preferredName || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                placeholder="Enter preferred name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Full Name <span className="text-red-600">*</span>
                <span className="text-xs text-gray-500 ml-1">(uppercase letters only)</span>
              </label>
              <input
                type="text"
                name="nric_FullName"
                value={account?.nric_FullName || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                NRIC <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nric"
                value={account?.nric || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">NRIC Address</label>
              <input
                type="text"
                name="nric_Address"
                value={account?.nric_Address || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                name="nric_DateOfBirth"
                value={account?.nric_DateOfBirth || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <div className="flex flex-row mt-3 space-x-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="nric_Gender"
                    value="M"
                    checked={account?.nric_Gender === "M"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="nric_Gender"
                    value="F"
                    checked={account?.nric_Gender === "F"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Female
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">
                <div className="flex items-center gap-1">
                  <p>Lockout Enabled</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="h-4 w-4 text-blue-500"/></TooltipTrigger>
                      <TooltipContent>
                        Indicates whether the account has been temporarily disabled.
                      </TooltipContent>
                    </Tooltip>
                    </TooltipProvider> 
                </div>
              </label>
              <div className="flex flex-row mt-3 space-x-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lockOutEnabled"
                    value="false"
                    checked={account?.lockOutEnabled === false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  No
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lockOutEnabled"
                    value="true"
                    checked={account?.lockOutEnabled === true}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">
                <div className="flex items-center gap-1">
                  <p>Lockout Reason</p>{account?.lockOutEnabled && <span className="text-red-600">*</span>}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="h-4 w-4 text-blue-500"/></TooltipTrigger>
                      <TooltipContent>
                        Reason for temporarily disabling the account.
                      </TooltipContent>
                    </Tooltip>
                    </TooltipProvider> 
                </div>
              </label>
              <input
                type="text"
                name="lockOutReason"
                value={account?.lockOutReason || ""}
                required={account?.lockOutEnabled}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Role <span className="text-red-600">*</span>
              </label>
              <select
                name="roleName"
                value={account?.roleName || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              >
                {roles.map((role) => (
                  <option key={role.roleName} value={role.roleName}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNo"
                value={account?.contactNo || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={account?.email || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
            {/* Optionally add lockOutEnd if you want to support editing it */}
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountInfoModal;
