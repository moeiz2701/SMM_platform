"use client";

import { useEffect, useState } from "react";
import Sidebar from '@/components/ClientSidebar';
import styles from '../../styling/ManagerSidebar.module.css';
import { ClientProvider } from "@/contexts/clientContext";
import API_ROUTES from "@/app/apiRoutes";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user info from backend
    fetch(API_ROUTES.AUTH.ME, {
      credentials: 'include', // Important: send cookies
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data._id) {
          setUserId(data.data._id);
        }
      });
  }, []);

  if (!userId) return <div>Loading...</div>;

  return (
    <ClientProvider userId={userId}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1 , marginLeft:'300px', paddingRight:'20px'}}>
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </ClientProvider>
  );
}
