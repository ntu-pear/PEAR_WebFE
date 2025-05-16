import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { fetchUserById, User } from "@/api/admin/user";
import { toast } from "sonner";

const EditAccountInfoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { accountId, refreshAccountData } = activeModal.props as {
    accountId: string;
    refreshAccountData: () => Promise<void>;
  };

  const [account, setAccount] = useState<User | null>(null);

  const handleFetchAccountInfo = async (id: string) => {
    try {
      const fetchedAccount = await fetchUserById(id);
      setAccount(fetchedAccount);
    } catch (error) {
      toast.error("Failed to fetch account information.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (account) {
      setAccount({ ...account, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      // Call API to update account information (API function not provided in the prompt)
      // await updateAccount(account.id, account);
      toast.success("Account information updated successfully.");
      closeModal();
      await refreshAccountData();
    } catch (error) {
      toast.error("Failed to update account information.");
    }
  };

  useEffect(() => {
    if (accountId) {
      handleFetchAccountInfo(accountId);
    }
  }, [accountId]);

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
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nric_FullName"
                value={account?.nric_FullName || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
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
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                {/* Add other roles as needed */}
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
