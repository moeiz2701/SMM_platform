import React from 'react'
import styles from '../styling/Navbar.module.css'
import { FaLeaf } from 'react-icons/fa'
import Link from 'next/link'


const Navbar = () => {
  return (
    <div className={styles.navbar}>
        <div className={styles.logo}>
            <FaLeaf className={styles.websiteLogo} />
            <h1 className={styles.websiteName}>SocialSync</h1>
        </div>
        <div className={styles.navLinks}>
            <p>Home</p>
            <p>About</p>
            <p>features</p>
            <p>Contact</p>
        </div>     
    </div>
  )
}

export default Navbar
