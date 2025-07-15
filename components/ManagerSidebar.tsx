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
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:3000/api/v1/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.data?.name || "",
            email: data.data?.email || ""
          });
        }
      } catch (e) {
        // Optionally handle error
      }
    }
    fetchUser();
  }, []);
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/manager" },
    { icon: FileText, label: "Content", href: "/content" },
    { icon: CalendarIcon, label: "Calendar", href: "/calendar" },
    { icon: User, label: "Client", href: "/client" },
    { icon: Mail, label: "Messages", href: "/messages" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: FileText, label: "Billing", href: "/billing" },
    { icon: Settings, label: "Settings", href: "/settings" },
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
              <User size={24} />
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
