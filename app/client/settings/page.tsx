"use client"

import { useState } from 'react'
import styles from '../../../styling/ClientSettings.module.css'

export default function ClientSettings() {
  const [activeTab, setActiveTab] = useState<'billing' | 'notifications' | 'security'>('billing')
  const [billingInfo, setBillingInfo] = useState({
    plan: 'Premium',
    paymentMethod: '•••• •••• •••• 4242',
    nextBillingDate: '2023-12-15'
  })

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    newsletter: true
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Client Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'billing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
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
        {activeTab === 'billing' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Billing Information</h2>
            
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Current Plan:</span>
                <span className={styles.infoValue}>{billingInfo.plan}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Payment Method:</span>
                <span className={styles.infoValue}>{billingInfo.paymentMethod}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Next Billing Date:</span>
                <span className={styles.infoValue}>{billingInfo.nextBillingDate}</span>
              </div>
            </div>

            <div className={styles.planOptions}>
              <h3 className={styles.optionsTitle}>Change Plan</h3>
              <div className={styles.plans}>
                <div className={`${styles.planCard} ${billingInfo.plan === 'Basic' ? styles.selectedPlan : ''}`}>
                  <h4>Basic</h4>
                  <p className={styles.planPrice}>$9.99/month</p>
                  <ul className={styles.planFeatures}>
                    <li>5 projects</li>
                    <li>Basic support</li>
                    <li>Email reports</li>
                  </ul>
                  <button className={styles.planButton}>
                    {billingInfo.plan === 'Basic' ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
                <div className={`${styles.planCard} ${billingInfo.plan === 'Premium' ? styles.selectedPlan : ''}`}>
                  <h4>Premium</h4>
                  <p className={styles.planPrice}>$29.99/month</p>
                  <ul className={styles.planFeatures}>
                    <li>Unlimited projects</li>
                    <li>Priority support</li>
                    <li>Advanced analytics</li>
                  </ul>
                  <button className={styles.planButton}>
                    {billingInfo.plan === 'Premium' ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <h3 className={styles.optionTitle}>Newsletter</h3>
                <p className={styles.optionDescription}>Receive our monthly newsletter</p>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notificationPrefs.newsletter}
                  onChange={() => setNotificationPrefs(prev => ({
                    ...prev,
                    newsletter: !prev.newsletter
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
          </div>
        )}
      </div>
    </div>
  )
}