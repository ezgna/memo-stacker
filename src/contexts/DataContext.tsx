import { createContext, ReactNode, useContext, useState } from "react";

interface DataContextType {
  dataUpdated: boolean;
  setDataUpdated: (dataUpdated: boolean) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [dataUpdated, setDataUpdated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <DataContext.Provider value={{ dataUpdated, setDataUpdated, searchQuery, setSearchQuery }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
