"use client";

import { useEffect, useState } from "react";
import Sidebar from '../../components/Sidebar';
import styles from '../../styling/ManagerSidebar.module.css';
import { ManagerProvider } from "@/contexts/managerContext"; // Change to ManagerProvider if you have one
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
    <ManagerProvider userId={userId}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar userRole={'Manager'} userType={'Manager'} />
        <main style={{ flex: 1 , paddingRight:'20px', overflow:'auto', padding:'2rem'}}>{children}</main>
      </div>
    </ManagerProvider>
  );
}
