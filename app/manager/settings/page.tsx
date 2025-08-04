"use client"

import { useState } from 'react'
import styles from '../../../styling/ManagerSettings.module.css'

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'security'>('notifications')
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    clientAlerts: true,
    systemUpdates: true
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manager Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'notifications' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Notification Preferences</h2>
            
            <div className={styles.notificationOption}>
              <div>
                <h3 className={styles.optionTitle}>Email Notifications</h3>
                <p className={styles.optionDescription}>Receive important updates via email</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notificationPrefs.email}
                  onChange={() => setNotificationPrefs(prev => ({
                    ...prev,
                    email: !prev.email
                  }))}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationOption}>
              <div>
                <h3 className={styles.optionTitle}>SMS Alerts</h3>
                <p className={styles.optionDescription}>Get urgent notifications via text</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notificationPrefs.sms}
                  onChange={() => setNotificationPrefs(prev => ({
                    ...prev,
                    sms: !prev.sms
                  }))}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationOption}>
              <div>
                <h3 className={styles.optionTitle}>Client Alerts</h3>
                <p className={styles.optionDescription}>Get notified about client activities</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notificationPrefs.clientAlerts}
                  onChange={() => setNotificationPrefs(prev => ({
                    ...prev,
                    clientAlerts: !prev.clientAlerts
                  }))}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationOption}>
              <div>
                <h3 className={styles.optionTitle}>System Updates</h3>
                <p className={styles.optionDescription}>Receive platform updates and announcements</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notificationPrefs.systemUpdates}
                  onChange={() => setNotificationPrefs(prev => ({
                    ...prev,
                    systemUpdates: !prev.systemUpdates
                  }))}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Security Settings</h2>
            
            <div className={styles.securityOption}>
              <h3 className={styles.optionTitle}>Change Password</h3>
              <button className={styles.securityButton}>
                Update Password
              </button>
            </div>

            <div className={styles.securityOption}>
              <h3 className={styles.optionTitle}>Two-Factor Authentication</h3>
              <div className={styles.securityStatus}>
                <span className={styles.statusIndicator}></span>
                <span>Disabled</span>
              </div>
              <button className={styles.securityButton}>
                Enable 2FA
              </button>
            </div>

            <div className={styles.securityOption}>
              <h3 className={styles.optionTitle}>Active Sessions</h3>
              <p className={styles.securityDescription}>
                View and manage devices that are logged into your account
              </p>
              <button className={styles.securityButton}>
                Manage Sessions
              </button>
            </div>

            <div className={styles.securityOption}>
              <h3 className={styles.optionTitle}>Login History</h3>
              <p className={styles.securityDescription}>
                Review recent account access for suspicious activity
              </p>
              <button className={styles.securityButton}>
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}