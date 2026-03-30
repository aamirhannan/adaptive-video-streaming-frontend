import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type UIContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, toggleSidebar }),
    [sidebarOpen, toggleSidebar],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextValue => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
};
