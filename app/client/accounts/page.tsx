"use client"
import React, { useEffect, useState } from 'react'
import { FaUserFriends } from 'react-icons/fa'
import { FaRegFileAlt } from 'react-icons/fa'
import Image from 'next/image'
import styles from '../../../styling/SocialAccounts.module.css'

import API_ROUTES from '../../apiRoutes';

interface SocialAccount {
  platform: string;
  followersCount: number;
  postCount: number;
  accountName: string;
  profilePhoto?: string;
  description?: string; // Optional description for the account
}

interface Client {
  profilePhoto?: string;
}

const page = () => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [clientProfilePhoto, setClientProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get social accounts
        const accRes = await fetch(API_ROUTES.SOCIAL_ACCOUNTS.GET_ALL, { credentials: 'include' });
        if (accRes.ok) {
          const accData = await accRes.json();
          setSocialAccounts(accData.data || []);
        }
        // Get client profile photo
        const userRes = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data?._id) {
            const clientRes = await fetch(`${API_ROUTES.CLIENTS.CREATE}?user=${userData.data._id}`, { credentials: 'include' });
            if (clientRes.ok) {
              const clientData = await clientRes.json();
              if (clientData.data && Array.isArray(clientData.data) && clientData.data.length > 0) {
                setClientProfilePhoto(clientData.data[0].profilePhoto || null);
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    fetchData();
  }, []);

  const getAccount = (platform: string) => socialAccounts.find(acc => acc.platform === platform);

  // Updated function to handle OAuth redirect
  const handleConnectSocialAccount = (platform: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `http://localhost:3000/api/v1/oauth/${platform}`;
  };

  return (
    <div>
      <h2>Your Social Accounts</h2>
      <div className={styles.accountDisplay}>
        {/* Instagram */}
        <div className={styles.instagram} style={{cursor:'pointer'}} onClick={() => !getAccount('instagram') && handleConnectSocialAccount('instagram')}>
          {getAccount('instagram') ? (
            <div className={styles.accountDetails} style={{ position: 'relative' }}>
              {/* Platform icon top-left */}
              <div style={{ position: 'absolute', top: 90, left: 10 }}>
                <Image src="/icons/instagram.svg" alt="Instagram" width={32} height={32} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {clientProfilePhoto && (
                  <Image
                    src={clientProfilePhoto}
                    alt="Profile"
                    width={100}
                    height={100}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ display: 'inline', marginBottom: 0 }}>{getAccount('instagram')?.accountName || ''}</h3>
                  <span>{getAccount('instagram')?.description || ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUserFriends /> {getAccount('instagram')?.followersCount}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaRegFileAlt /> {getAccount('instagram')?.postCount}
                </p>
              </div>
            </div>
          ) : (
            <>
            <Image src="/icons/instagram.svg" alt="Instagram" width={60} height={60} />
            <p>Add your instagram</p>
            </>
          )}
        </div>
        {/* LinkedIn */}
        <div className={styles.linkdin} style={{cursor:'pointer'}} onClick={() => !getAccount('linkedin') && handleConnectSocialAccount('linkedin')}>
          {getAccount('linkedin') ? (
            <div className={styles.accountDetails} style={{ position: 'relative' }}>
              {/* Platform icon top-left */}
              <div style={{ position: 'absolute', top: 90, left: 10 }}>
                <Image src="/icons/linkedin.svg" alt="LinkedIn" width={32} height={32} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {clientProfilePhoto && (
                  <Image
                    src={clientProfilePhoto}
                    alt="Profile"
                    width={100}
                    height={100}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ display: 'inline', marginBottom: 0 }}>{getAccount('linkedin')?.accountName || ''}</h3>
                  <span >{getAccount('linkedin')?.description || ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUserFriends /> {getAccount('linkedin')?.followersCount}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaRegFileAlt /> {getAccount('linkedin')?.postCount}
                </p>
              </div>
            </div>
          ) : (
             <>
            <Image src="/icons/linkedin.svg" alt="LinkedIn" width={60} height={60} />
            <p>Add your linkedin</p>
            </>
          )}
        </div>
        {/* Facebook */}
        <div className={styles.facebook} style={{cursor:'pointer'}} onClick={() => !getAccount('facebook') && handleConnectSocialAccount('facebook')}>
          {getAccount('facebook') ? (
            <div className={styles.accountDetails} style={{ position: 'relative' }}>
              {/* Platform icon top-left */}
              <div style={{ position: 'absolute', top: 90, left: 10 }}>
                <Image src="/icons/facebook.svg" alt="Facebook" width={32} height={32} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {clientProfilePhoto && (
                  <Image
                    src={clientProfilePhoto}
                    alt="Profile"
                    width={100}
                    height={100}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ display: 'inline', marginBottom: 0 }}>{getAccount('facebook')?.accountName || ''}</h3>
                  <span >{getAccount('facebook')?.description || ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUserFriends /> {getAccount('facebook')?.followersCount}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaRegFileAlt /> {getAccount('facebook')?.postCount}
                </p>
              </div>
            </div>
          ) : (
             <>
            <Image src="/icons/facebook.svg" alt="Facebook" width={60} height={60} />
            <p>Add your facebook</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default page