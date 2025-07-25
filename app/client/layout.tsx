
import Sidebar from '@/components/ClientSidebar';
import styles from '../../styling/ManagerSidebar.module.css';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1 , marginLeft:'320px', paddingRight:'20px'}}>{children}</main>
    </div>
  );
}

