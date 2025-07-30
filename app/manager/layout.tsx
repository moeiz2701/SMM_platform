"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import styles from "../../styling/ManagerSidebar.module.css";
import { ManagerProvider } from "@/contexts/managerContext";
import API_ROUTES from "@/app/apiRoutes";
import "../globals.css";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [managerExists, setManagerExists] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    async function fetchManagerData() {
      try {
        const res = await fetch(API_ROUTES.MANAGERS.ME, { credentials: "include" });

        if (res.ok) {
          const data = await res.json();

          if (data.success) {
            if (data.data && data.data._id) {
              if (data.data.user && data.data.user._id) {
                setUserId(data.data.user._id);
              } else if (data.data.user) {
                setUserId(data.data.user.toString());
              } else {
                const authRes = await fetch(API_ROUTES.AUTH.ME, { credentials: "include" });
                if (authRes.ok) {
                  const authData = await authRes.json();
                  if (authData.success && authData.data && authData.data._id) {
                    setUserId(authData.data._id);
                  }
                }
              }
              setManagerExists(true);
            } else if (data.data === null) {
              const authRes = await fetch(API_ROUTES.AUTH.ME, { credentials: "include" });
              if (authRes.ok) {
                const authData = await authRes.json();
                if (authData.success && authData.data && authData.data._id) {
                  setUserId(authData.data._id);
                }
              }
              setManagerExists(false);
            } else {
              setManagerExists(false);
            }
          } else {
            setManagerExists(false);
          }
        } else {
          const errorData = await res.json();
          console.warn("Manager ME route failed:", errorData);
          setManagerExists(false);
        }
      } catch (err) {
        console.error("Failed to fetch manager data:", err);
        setManagerExists(false);
      }
    }

    fetchManagerData();
  }, [isHydrated]);

  useEffect(() => {
    if (managerExists === null) return;

    if (!managerExists && pathname !== "/manager/profileCompletion") {
      router.replace("/manager/profileCompletion");
    }

    if (managerExists && pathname === "/manager/profileCompletion") {
      router.replace("/manager");
    }
  }, [managerExists, pathname, router]);

  if (!userId || managerExists === null) return <div>Loading...</div>;

  return (
    <ManagerProvider userId={userId}>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar userRole={"Manager"} userType={"Manager"} />
        <main style={{ flex: 1, paddingRight: "20px", overflow: "auto", padding: "2rem" }}>
          {children}
        </main>
      </div>
    </ManagerProvider>
  );
}
