"use client";

import { useEffect, useState } from "react";
import Sidebar from '@/components/Sidebar';
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
      <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar userRole={'User'} userType={'User'} />
      <main style={{ flex: 1 , paddingRight:'20px', overflow:'auto', padding:'2rem'}}>{children}</main>
    </div>
    </ClientProvider>
  );
}

