"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import API_ROUTES from "../app/apiRoutes";

interface ClientContextType {
  client: any | null;
  loading: boolean;
  setClient: React.Dispatch<React.SetStateAction<any | null>>;
  refreshClient: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ROUTES.CLIENTS.ME, {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setClient(data.data); // Assuming your API returns { success: true, data: {...} }
      } else {
        setClient(null);
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  return (
    <ClientContext.Provider
      value={{ client, loading, setClient, refreshClient: fetchClient }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};