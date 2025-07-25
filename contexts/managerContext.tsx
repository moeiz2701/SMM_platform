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
  refreshManager: () => void;
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
      const res = await fetch(API_ROUTES.MANAGERS.GET_BY_USER(userId), {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setManager(data.manager); // adapt to actual response shape if needed
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
    }
  }, [userId]);

  return (
    <ManagerContext.Provider
      value={{ manager, loading, setManager, refreshManager: fetchManager }}
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