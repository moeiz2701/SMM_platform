
import Sidebar from '../../components/Sidebar';
import styles from '../../styling/ManagerSidebar.module.css';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar userRole={'Manager'} userType={'Manager'} />
      <main style={{ flex: 1 , paddingRight:'20px', overflow:'auto'}}>{children}</main>
    </div>
  );
}
