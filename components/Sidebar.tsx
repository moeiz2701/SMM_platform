'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IconUsers, IconChartBar, IconFileText, IconSettings, IconMenu2, IconX, IconUser } from '@tabler/icons-react';
import style from '@/styling/sidebar.module.css';
import API_ROUTES from '@/app/apiRoutes';
import Image from 'next/image';
import { Home, User, Settings, Mail, FileText, Menu, X, Calendar as CalendarIcon } from "lucide-react";

interface SidebarProps {
  userRole: string;
  userType: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/manager',
    icon: <IconChartBar className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Content',
    href: '/manager/content',
    icon: <IconFileText className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Calendar',
    href: '/manager/calendar',
    icon: <IconFileText className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Clients',
    href: '/manager/client',
    icon: <IconUsers className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Messages',
    href: '/manager/messages',
    icon: <IconFileText className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Reports',
    href: '/manager/reports',
    icon: <IconFileText className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Billing',
    href: '/manager/billing',
    icon: <IconFileText className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Profile',
    href: '/manager/profile',
    icon: <IconUsers className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  {
    label: 'Settings',
    href: '/manager/settings',
    icon: <IconSettings className="w-5 h-5" />,
    allowedRoles: ['Manager']
  },
  // User nav items from ClientSidebar
  {
    label: 'Dashboard',
    href: '/client',
    icon: <Home className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Social Accounts',
    href: '/client/accounts',
    icon: <User className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Calendar',
    href: '/client/calendar',
    icon: <CalendarIcon className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Profile',
    href: '/client/profile',
    icon: <User className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Manager',
    href: '/client/manager',
    icon: <Mail className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Requests',
    href: '/client/requests',
    icon: <Mail className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Notifications',
    href: '/client/notifications',
    icon: <FileText className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Support',
    href: '/client/support',
    icon: <Settings className="w-5 h-5" />, 
    allowedRoles: ['User']
  },
  {
    label: 'Settings',
    href: '/client/settings',
    icon: <Settings className="w-5 h-5" />, 
    allowedRoles: ['User']
  }
];

export default function Sidebar({ userRole, userType }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [manager, setManager] = useState<{ profilePhoto?: string; name?: string; email?: string } | null>(null);

  const filteredNavItems = navItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  const handleNavigation = (href: string) => {
    router.push(href);
  };
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
  

  return (
    <div className={`${style.sidebar} ${isCollapsed ? style.collapsed : style.expanded}`}> 
      <div className={style.sidebarInner}>
        <div className={style.header}>
          <div className={style.headerTop}>
            {!isCollapsed && (
              <h2 className={style.dashboardTitle}>Manager</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={style.collapseBtn}
            >
              {isCollapsed ? <IconMenu2 className={style.collapseIcon} /> : <IconX className={style.collapseIcon} />}
            </button>
          </div>
        </div>

        <nav className={style.nav}>
          <ul className={style.navList}>
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <button
                  
                  className={
                    `${style.navBtn} ${isCollapsed ? style.navBtnCollapsed : style.navBtnExpanded}` +
                    (pathname === item.href ? ` ${style.navBtnActive}` : '')
                  }
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className={style.navLabel}>{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {!isCollapsed && (
           <div className={style["sidebar-footer"]}>
           <div className={style["user-profile"]}>
             <div className={style["user-avatar"]}>
               {manager?.profilePhoto ? (
                 <Image
                   src={manager.profilePhoto}
                   alt="Profile Photo"
                   width={40}
                   height={40}
                   className={style["profile-photo-img"]}
                 />
               ) : (
                 <IconUser size={24} />
               )}
             </div>
             <div className={style["user-info"]}>
               <p className={style["user-name"]}>{manager?.name || user?.name || "Account"}</p>
               <p className={style["user-email"]}>{manager?.email || user?.email || "email@example.com"}</p>
             </div>
           </div>
         </div>
        )}
      </div>
    </div>
  );
}
