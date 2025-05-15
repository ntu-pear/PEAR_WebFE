import { fetchUserById, User } from "@/api/admin/user";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export interface ViewAccountContextType {
  id: string | undefined;
  accountInfo: User | null;
  createdByAccount: User | null;
  modifiedByAccount: User | null;
  refreshAccountData: () => Promise<void>;
}

const ViewAccountContext = createContext<ViewAccountContextType | undefined>(
  undefined
);

export const ViewAccountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { id } = useParams<{ id: string }>();
  const [accountInfo, setAccountInfo] = useState<User | null>(null);
  const [createdByAccount, setCreatedByAccount] = useState<User | null>(null);
  const [modifiedByAccount, setModifiedByAccount] = useState<User | null>(null);

  const refreshAccountData = async () => {
    if (!id) return;
    try {
      const fetchedAccountInfo: User = await fetchUserById(id);
      setAccountInfo(fetchedAccountInfo);

      if (fetchedAccountInfo.createdById) {
        const fetchedCreatedByAccount = await fetchUserById(
          fetchedAccountInfo.createdById
        );
        setCreatedByAccount(fetchedCreatedByAccount);
      } else {
        setCreatedByAccount(null);
      }

      if (fetchedAccountInfo.modifiedById) {
        const fetchedModifiedByAccount = await fetchUserById(
          fetchedAccountInfo.modifiedById
        );
        setModifiedByAccount(fetchedModifiedByAccount);
      } else {
        setModifiedByAccount(null);
      }
    } catch (error) {
      toast.error("Failed to fetch account information");
    }
  };

  useEffect(() => {
    refreshAccountData();
  }, []);

  return (
    <ViewAccountContext.Provider
      value={{
        id,
        accountInfo,
        createdByAccount,
        modifiedByAccount,
        refreshAccountData,
      }}
    >
      {children}
    </ViewAccountContext.Provider>
  );
};

export const useViewAccount = () => {
  const context = useContext(ViewAccountContext);
  if (!context) {
    throw new Error(
      "useViewAccount must be used within an ViewAccountProvider"
    );
  }
  return context;
};
