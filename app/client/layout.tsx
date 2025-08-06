"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import styles from '../../styling/ManagerSidebar.module.css';
import { ClientProvider } from "@/contexts/clientContext";
import API_ROUTES from "@/app/apiRoutes";
import '../globals.css';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [clientExists, setClientExists] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure hydration before running client-side logic
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    async function fetchClientData() {
      try {
        console.log("Fetching client data from:", API_ROUTES.CLIENTS.ME);
        const res = await fetch(API_ROUTES.CLIENTS.ME, { credentials: 'include' });
        console.log("Client ME response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("Client ME response data:", data);
          
          if (data.success) {
            if (data.data && data.data._id) {
              // Client exists - check if user data is populated
              console.log("Client found with ID:", data.data._id);
              
              if (data.data.user && data.data.user._id) {
                // Client exists and has populated user data
                console.log("Client exists with populated user, setting userId:", data.data.user._id);
                setUserId(data.data.user._id);
                setClientExists(true);
              } else if (data.data.user) {
                // Client exists but user is just an ObjectId string
                console.log("Client exists with user ObjectId:", data.data.user);
                setUserId(data.data.user.toString());
                setClientExists(true);
              } else {
                // Client exists but no user field - this shouldn't happen, get from auth
                console.log("Client exists but no user field, fetching from auth");
                try {
                  const authRes = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' });
                  if (authRes.ok) {
                    const authData = await authRes.json();
                    console.log("Auth ME response data:", authData);
                    if (authData.success && authData.data && authData.data._id) {
                      console.log("Setting userId from auth:", authData.data._id);
                      setUserId(authData.data._id);
                      setClientExists(true);
                    }
                  }
                } catch (authErr) {
                  console.error("Failed to fetch auth data:", authErr);
                  setClientExists(false);
                }
              }
            } else if (data.data === null) {
              // API returned null - no client profile exists, but we need to get userId from auth
              console.log("No client profile found, fetching user from auth");
              try {
                const authRes = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' });
                if (authRes.ok) {
                  const authData = await authRes.json();
                  console.log("Auth ME response data:", authData);
                  if (authData.success && authData.data && authData.data._id) {
                    console.log("Setting userId from auth:", authData.data._id);
                    setUserId(authData.data._id);
                  }
                }
              } catch (authErr) {
                console.error("Failed to fetch auth data:", authErr);
              }
              setClientExists(false);
            } else {
              // Unexpected data structure
              console.log("Unexpected data structure:", data.data);
              setClientExists(false);
            }
          } else {
            // API returned success: false
            console.log("API returned success: false");
            setClientExists(false);
          }
        } else {
          // HTTP error response
          const errorData = await res.json();
          console.warn("Client ME route failed:", errorData);
          setClientExists(false);
        }
      } catch (err) {
        console.error("Failed to fetch client data:", err);
        setClientExists(false);
      }
    }

    fetchClientData();
  }, [isHydrated]);

  // Redirect logic based on client presence
  useEffect(() => {
    if (clientExists === null) return;

    if (!clientExists && pathname !== "/client/profileCompletion") {
      router.replace("/client/profileCompletion");
    }

    if (clientExists && pathname === "/client/profileCompletion") {
      router.replace("/client");
    }
  }, [clientExists, pathname, router]);

  if (!userId || clientExists === null) return <div>Loading...</div>;

 return (
  <ClientProvider>
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar 
        userRole={clientExists ? 'client' : 'user'} 
        userType={clientExists ? 'client' : 'user'} 
        clientExists={clientExists} 
      />
      <main style={{ flex: 1, paddingRight: '20px', overflow: 'auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  </ClientProvider>
);
}
