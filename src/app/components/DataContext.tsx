import { createContext, ReactNode, useContext, useState } from "react";

interface dataContextType {
  dataUpdated: boolean;
  setDataUpdated: (updated: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const dataContext = createContext<dataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [dataUpdated, setDataUpdated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <dataContext.Provider value={{ dataUpdated, setDataUpdated, searchQuery, setSearchQuery }}>
      {children}
    </dataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(dataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider. Check ContextProviders.tsx");
  }
  return context;
};
