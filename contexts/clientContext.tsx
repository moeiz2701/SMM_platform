"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Client } from "@/types/client"; // Optional: move Client interface there
import API_ROUTES from "../app/apiRoutes"; // Adjust path as needed

interface ClientContextType {
  client: Client | null;
  loading: boolean;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
  refreshClient: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClient = async () => {
    try {
      const res = await fetch(API_ROUTES.CLIENTS.BY_USER(userId), {
        credentials: "include", // include cookies/token
      });
      if (res.ok) {
        const data = await res.json();
        setClient(data.client); // adapt to actual response shape
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
    if (userId) {
      fetchClient();
    }
  }, [userId]);

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
