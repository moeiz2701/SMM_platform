"use client"


import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import styles from "../styling/ManagerSidebar.module.css"
import Link from "next/link"
import { Home, User, Settings, Mail, FileText, Menu, X, Calendar as CalendarIcon } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import { FaLeaf } from "react-icons/fa"


interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [clientProfilePhoto, setClientProfilePhoto] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUserAndClient() {
      try {
        const res = await fetch(API_ROUTES.AUTH.ME, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.data?.name || "",
            email: data.data?.email || ""
          });

          // Fetch client profile for this user
          if (data.data?._id) {
            const clientRes = await fetch(`${API_ROUTES.CLIENTS.CREATE}?user=${data.data._id}`, { credentials: "include" });
            if (clientRes.ok) {
              const clientData = await clientRes.json();
              if (clientData.data && Array.isArray(clientData.data) && clientData.data.length > 0) {
                setClientProfilePhoto(clientData.data[0].profilePhoto || null);
              }
            }
          }
        }
      } catch (e) {
        // Optionally handle error
      }
    }
    fetchUserAndClient();
  }, []);
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/client" },
    { icon: User, label: "Social Accounts", href: "/client/accounts" },
    { icon: CalendarIcon, label: "Calendar", href: "/client/calendar" },
    { icon: User, label: "Profile", href: "/client/profile" },
    { icon: Mail, label: "Manager", href: "/client/manager" },
    { icon: Mail, label: "Requests", href: "/client/requests" },
    { icon: FileText, label: "Notifications", href: "/client/notifications" },
    { icon: Mail, label: "Messages", href: "/client/message" },
    { icon: Settings, label: "Settings", href: "/client/settings" },
  ];
  return (
    <>
      {/* Mobile menu button */}
      <button className={styles["mobile-menu-btn"]} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className={styles["sidebar-overlay"]} onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles["sidebar-open"] : ""} ${className}`}>
        <div className="logo">
            <FaLeaf className="websiteLogo" />
            <h1 className={styles.websiteName}>SocialSync</h1>
        </div>

        <nav className={styles["sidebar-nav"]}>
          <ul className={styles["sidebar-menu"]}>
            {menuItems.map((item, index) => {
              const isSelected = pathname === item.href;
              return (
                <li
                  key={index}
                  className={
                    styles["sidebar-menu-item"] +
                    (isSelected ? " " + styles["selected"] : "")
                  }
                >
                  <Link href={item.href} className={styles["sidebar-link"]}>
                    <item.icon className={styles["sidebar-icon"]} size={20} />
                    <span className={styles["sidebar-label"]}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles["sidebar-footer"]}>
          <div className={styles["user-profile"]}>
            <div className={styles["user-avatar"]}>
              {clientProfilePhoto ? (
                <img
                  src={clientProfilePhoto}
                  alt={user?.name || "User"}
                  className={styles["profile-photo"]}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className={styles["user-info"]}>
               <p className={styles["user-name"]}>{user?.name || "Account"}</p>
              <p className={styles["user-email"]}>{user?.email || "email@example.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      
    </>
  )
}
