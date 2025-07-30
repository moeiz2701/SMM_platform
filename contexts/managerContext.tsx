"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Manager } from "@/types/manager";
import API_ROUTES from "../app/apiRoutes";

interface ManagerContextType {
  manager: Manager | null;
  loading: boolean;
  setManager: React.Dispatch<React.SetStateAction<Manager | null>>;
  refreshManager: () => Promise<void>;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

export const ManagerProvider = ({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) => {
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchManager = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ROUTES.MANAGERS.GET_BY_USER(userId), {
        credentials: "include",
      });
      const data = await res.json();
      
      if (res.ok && data.data) {
        setManager(data.data); // Changed from data.manager to data.data
      } else {
        setManager(null);
      }
    } catch (error) {
      console.error("Error fetching manager:", error);
      setManager(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchManager();
    } else {
      setLoading(false);
    }
  }, [userId]);

  return (
    <ManagerContext.Provider
      value={{ 
        manager, 
        loading, 
        setManager, 
        refreshManager: fetchManager 
      }}
    >
      {children}
    </ManagerContext.Provider>
  );
};

export const useManager = () => {
  const context = useContext(ManagerContext);
  if (context === undefined) {
    throw new Error("useManager must be used within a ManagerProvider");
  }
  return context;
};