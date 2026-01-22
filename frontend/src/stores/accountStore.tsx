import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  GetAccounts,
  AddOfflineAccount,
  LoginElyBy,
  SetActiveAccount,
  GetActiveAccount,
} from "../../wailsjs/go/main/App";
import { Account } from "../types";

function useAuthLogic() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccountState] = useState<Account | null>(null);

  const [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    refreshAccounts().then(() => setInitialized(true));
  }, []);

  const refreshAccounts = async () => {
    try {
      const accs = await GetAccounts();
      setAccounts(accs || []);
      const active = await GetActiveAccount();
      setActiveAccountState(active);
    } catch (e) {
      console.error("Failed to load accounts", e);
    }
  };

  const addOfflineAccount = async (username: string) => {
    try {
      await AddOfflineAccount(username);
      await refreshAccounts();
    } catch (e) {
      console.error("Failed to add account", e);
      throw e;
    }
  };

  const loginElyBy = async (u: string, p: string) => {
    try {
      await LoginElyBy(u, p);
      await refreshAccounts();
    } catch (e) {
      throw e;
    }
  };

  const switchAccount = async (uuid: string) => {
    try {
      await SetActiveAccount(uuid);
      await refreshAccounts();
    } catch (e) {
      console.error("Failed to switch account", e);
    }
  };

  return {
    accounts,
    activeAccount,
    isInitialized,
    addOfflineAccount,
    loginElyBy,
    switchAccount,
    refreshAccounts,
  };
}

const AccountContext = createContext<ReturnType<typeof useAuthLogic> | null>(
  null,
);

export function AccountProvider({ children }: { children: ReactNode }) {
  const store = useAuthLogic();
  return (
    <AccountContext.Provider value={store}>{children}</AccountContext.Provider>
  );
}

export function useAccountStore() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccountStore must be used within an AccountProvider");
  }
  return context;
}
