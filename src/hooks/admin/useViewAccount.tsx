import { fetchUserById, fetchUserNRIC, User } from "@/api/admin/user";
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
  nricData: {
    nric: string;
    maskedNric: string;
    isMasked: boolean;
  };
  getNRIC: () => string;
  setAccountInfo: React.Dispatch<React.SetStateAction<User | null>>;
  refreshAccountData: () => Promise<void>;
  handleNRICToggle: () => Promise<void>;
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
  const [nricData, setNricData] = useState<{
    nric: string;
    maskedNric: string;
    isMasked: boolean;
  }>({ nric: "", maskedNric: "", isMasked: false });

  const refreshAccountData = async () => {
    if (!id) return;
    try {
      const fetchedAccountInfo: User = await fetchUserById(id);
      setAccountInfo(fetchedAccountInfo);
      setNricData({
        nric: "",
        maskedNric: fetchedAccountInfo.nric,
        isMasked: true,
      });

      if (fetchedAccountInfo.createdById) {
        try {
          const fetchedCreatedByAccount = await fetchUserById(
            fetchedAccountInfo.createdById
          );
          setCreatedByAccount(fetchedCreatedByAccount);
        } catch {
          setCreatedByAccount(null);
        }
      } else {
        setCreatedByAccount(null);
      }

      if (fetchedAccountInfo.modifiedById) {
        try {
          const fetchedModifiedByAccount = await fetchUserById(
            fetchedAccountInfo.modifiedById
          );
          setModifiedByAccount(fetchedModifiedByAccount);
        } catch {
          setModifiedByAccount(null);
        }
      } else {
        setModifiedByAccount(null);
      }
    } catch (error) {
      toast.error("Failed to fetch account information");
    }
  };

  //get nric depending on the isMasked state
  const getNRIC = () => {
    if (nricData.isMasked) {
      return nricData.maskedNric;
    }
    return nricData.nric;
  }

  const handleNRICToggle = async () => {
    if (!id) return;
    if (!nricData.isMasked || nricData.nric) {
      setNricData((prevState) => ({
        nric: prevState.nric,
        maskedNric: prevState.maskedNric,
        isMasked: !prevState.isMasked,
      }));
      return;
    }

    try {
      const updatedNric: string = await fetchUserNRIC(id);

      setNricData((prevState) => ({
        nric: updatedNric,
        maskedNric: prevState.maskedNric,
        isMasked: !prevState.isMasked,
      }));
    } catch (error) {
      toast.error("Failed to fetch patient NRIC");
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
        nricData,
        getNRIC,
        setAccountInfo,
        refreshAccountData,
        handleNRICToggle,
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
