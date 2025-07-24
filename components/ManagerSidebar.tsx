"use client"


import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import styles from "../styling/ManagerSidebar.module.css"
import Link from "next/link"
import { Home, User, Settings, Mail, FileText, Menu, X, Calendar as CalendarIcon } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import { FaLeaf } from "react-icons/fa"
import Image from "next/image"


interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [manager, setManager] = useState<{ profilePhoto?: string; name?: string; email?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUserAndManager() {
      try {
        // Get user info
        const res = await fetch(API_ROUTES.AUTH.ME, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.data?.name || "",
            email: data.data?.email || ""
          });
          // Now fetch manager profile using user._id
          if (data.data?._id) {
            const mgrRes = await fetch(API_ROUTES.MANAGERS.GET_BY_USER(data.data._id), { credentials: "include" });
            if (mgrRes.ok) {
              const mgrData = await mgrRes.json();
              setManager({
                profilePhoto: mgrData.data?.profilePhoto || "",
                name: mgrData.data?.user?.name || data.data?.name || "",
                email: mgrData.data?.user?.email || data.data?.email || ""
              });
            }
          }
        }
      } catch (e) {
        // Optionally handle error
      }
    }
    fetchUserAndManager();
  }, []);
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/manager" },
    { icon: FileText, label: "Content", href: "/manager/content" },
    { icon: CalendarIcon, label: "Calendar", href: "/manager/calendar" },
    { icon: User, label: "Client", href: "/manager/client" },
    { icon: Mail, label: "Messages", href: "/manager/messages" },
    { icon: FileText, label: "Reports", href: "/manager/reports" },
    { icon: FileText, label: "Billing", href: "/manager/billing" },
    { icon: FileText, label: "Profile", href: "/manager/profile" },
    { icon: Settings, label: "Settings", href: "manager/settings" },
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
              {manager?.profilePhoto ? (
                <Image
                  src={manager.profilePhoto}
                  alt="Profile Photo"
                  width={40}
                  height={40}
                  className={styles["profile-photo-img"]}
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className={styles["user-info"]}>
              <p className={styles["user-name"]}>{manager?.name || user?.name || "Account"}</p>
              <p className={styles["user-email"]}>{manager?.email || user?.email || "email@example.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      
    </>
  )
}
