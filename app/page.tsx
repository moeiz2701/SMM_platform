'use client';


import Image from "next/image";
import styles from "../styling/landing.module.css";
import Navbar from "@/components/Navbar";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleContinue = (role: string) => {
    router.push(`/auth/sign_up?role=${role}`);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.buttons}>
        <button onClick={() => handleContinue('user')}>Continue as user</button>
        <button onClick={() => handleContinue('manager')}>Continue as Manager</button>
      </div>
    </div>
  );
}
