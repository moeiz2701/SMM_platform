"use client"

import { useState, useEffect } from "react"
import { User, Phone, Building, Globe, Star, Calendar, Users, MessageSquare, ExternalLink, Mail, Award, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { API_ROUTES } from "@/app/apiRoutes"
import styles from '../../../styling/managerProfile.module.css'

interface Manager {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'active' | 'inactive';
  rating: number;
  experience: number;
  createdAt: string;
  department: string;
  phone: string;
  profilePhoto?: string;
  website?: string;
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  managedClients: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
  reviews: Array<{
    _id: string;
    reviewer: string | {
      _id: string;
      name: string;
    };
    reviewerName?: string;
    reviewerId?: string;
    date: string;
    rating: number;
    comment: string;
  }>;
}

type Props = {
  id: string
}

export default function ManagerProfilePage({ id }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')
  const [manager, setManager] = useState<Manager | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    const fetchManager = async () => {
      try {
        setLoading(true)
        const res = await fetch(API_ROUTES.MANAGERS.GET_ONE(id), {
          credentials: 'include'
        })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON')
        }
        
        const data = await res.json()
        
        if (data.success && data.data) {
          setManager(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch manager data')
        }
      } catch (err) {
        console.error("Failed to load manager:", err)
        setManager(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchManager()
  }, [id])

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileWrapper}>
          <div className={styles.loading}>Loading manager profile...</div>
        </div>
      </div>
    )
  }

  if (!manager) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileWrapper}>
          <div className={styles.error}>Manager not found or failed to load.</div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle size={16} className={styles.statusIconActive} />
      case 'inactive':
      case 'rejected':
        return <XCircle size={16} className={styles.statusIconInactive} />
      case 'pending':
        return <AlertCircle size={16} className={styles.statusIconPending} />
      default:
        return null
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${star}`}
            size={16}
            className={`${styles.star} ${star <= rating ? styles.starFilled : ''}`}
          />
        ))}
        <span className={styles.ratingText}>({rating.toFixed(1)})</span>
      </div>
    )
  }

  const renderSocialLinks = () => {
    const socialPlatforms = [
      { key: 'linkedin', name: 'LinkedIn', color: '#0077b5' },
      { key: 'twitter', name: 'Twitter', color: '#1da1f2' },
      { key: 'facebook', name: 'Facebook', color: '#1877f2' },
      { key: 'instagram', name: 'Instagram', color: '#e4405f' }
    ]

    if (!manager.socialMedia) return null

    return (
      <div className={styles.socialLinks}>
        {socialPlatforms.map((platform) => {
          const url = manager.socialMedia?.[platform.key as keyof typeof manager.socialMedia]
          if (!url) return null
          
          return (
            <a
              key={`social-${platform.key}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              style={{ '--social-color': platform.color } as React.CSSProperties}
            >
              <Globe size={16} />
              <span>{platform.name}</span>
              <ExternalLink size={12} />
            </a>
          )
        })}
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.managedClients?.length || 0}</h3>
            <p>Managed Clients</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.rating?.toFixed(1) || '0.0'}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MessageSquare size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.reviews?.length || 0}</h3>
            <p>Total Reviews</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.experience || 0}</h3>
            <p>Years Experience</p>
          </div>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3>Professional Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Phone size={16} />
            <span>{manager.phone || 'Not provided'}</span>
          </div>
          <div className={styles.infoItem}>
            <Mail size={16} />
            <span>{manager.user?.email || 'Not provided'}</span>
          </div>
          <div className={styles.infoItem}>
            <Building size={16} />
            <span>{manager.department || 'Not specified'} Department</span>
          </div>
          <div className={styles.infoItem}>
            <Calendar size={16} />
            <span>Joined {formatDate(manager.createdAt || new Date().toISOString())}</span>
          </div>
          {manager.website && (
            <div className={styles.infoItem}>
              <Globe size={16} />
              <a href={manager.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                {manager.website}
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>

      {(manager.socialMedia?.linkedin || manager.socialMedia?.twitter || manager.socialMedia?.facebook || manager.socialMedia?.instagram) && (
        <div className={styles.infoSection}>
          <h3>Social Media</h3>
          {renderSocialLinks()}
        </div>
      )}
    </div>
  )

  const renderReviewsTab = () => {
    if (!manager) return null
    
    return (
      <div className={styles.tabContent}>
        <div className={styles.reviewsHeader}>
          <h3>Client Reviews ({manager.reviews?.length || 0})</h3>
          <div className={styles.overallRating}>
            {renderStars(manager.rating || 0)}
            <span className={styles.reviewCount}>Based on {manager.reviews?.length || 0} reviews</span>
          </div>
        </div>
        
        <div className={styles.reviewsList}>
          {(manager.reviews || []).map((review: any) => {
            const reviewerName = review.reviewerName || (typeof review.reviewer === 'object' ? review.reviewer.name : 'User')

            return (
              <div key={`review-${review._id}`} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerAvatar}>
                      {reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.reviewerDetails}>
                      <h4>{reviewerName}</h4>
                      <span className={styles.reviewDate}>{formatDate(review.date)}</span>
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileWrapper}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImageContainer}>
            <img
              src={manager.profilePhoto || "/placeholder.svg"}
              alt={manager.user?.name || 'Manager'}
              className={styles.profileImage}
            />
            <div className={styles.statusBadge}>
              {getStatusIcon(manager.status)}
              <span className={`${styles.statusText} ${styles[manager.status]}`}>
                {manager.status.charAt(0).toUpperCase() + manager.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{manager.user?.name || 'Unknown Manager'}</h1>
            <p className={styles.profileTitle}>{manager.department || 'Unknown'} Manager</p>
            <div className={styles.profileRating}>
              {renderStars(manager.rating || 0)}
            </div>
            <div className={styles.profileMeta}>
              <span className={styles.experience}>
                <Award size={16} />
                {manager.experience || 0} years experience
              </span>
              <span className={styles.joinDate}>
                <Calendar size={16} />
                Joined {formatDate(manager.createdAt || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={16} />
            Overview
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={16} />
            Reviews ({manager.reviews?.length || 0})
          </button>
        </div>

        <div className={styles.tabContainer}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
        </div>
      </div>
    </div>
  )
}