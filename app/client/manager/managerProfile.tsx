"use client"

import { useState, useEffect } from "react"
import { User, Phone, Building, Globe, Star, Calendar, Users, MessageSquare, ExternalLink, Mail, MapPin, Award, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import styles from "./ManagerProfile.module.css"
import API_ROUTES from "@/app/apiRoutes"

// Mock data - in real app this would come from API/props
type Props = {
  id: string
}

export default function ManagerProfilePage({ id }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'reviews' | 'requests'>('overview')
  const [manager, setManager] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    if (!id) return;
    const fetchManager = async () => {
      try {
        const res = await fetch(API_ROUTES.MANAGERS.GET_ONE(id));
        const data = await res.json();
        setManager(data.data); // assuming response shape: { success, data }
      } catch (err) {
        console.error("Failed to load manager:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [id]);
  if (!manager) return null

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
            key={star}
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
    if (loading || !manager) return null;

    return (
      <div className={styles.socialLinks}>
        {socialPlatforms.map((platform) => {
          const url = manager.socialMedia[platform.key as keyof typeof manager.socialMedia]
          if (!url) return null
          
          return (
            <a
              key={platform.key}
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
            <h3>{manager.managedClients.length}</h3>
            <p>Managed Clients</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.rating.toFixed(1)}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MessageSquare size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.reviews.length}</h3>
            <p>Total Reviews</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{manager.experience}</h3>
            <p>Years Experience</p>
          </div>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3>Professional Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Phone size={16} />
            <span>{manager.phone}</span>
          </div>
          <div className={styles.infoItem}>
            <Mail size={16} />
            <span>{manager.user.email}</span>
          </div>
          <div className={styles.infoItem}>
            <Building size={16} />
            <span>{manager.department} Department</span>
          </div>
          <div className={styles.infoItem}>
            <Calendar size={16} />
            <span>Joined {formatDate(manager.createdAt)}</span>
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

      {(manager.socialMedia.linkedin || manager.socialMedia.twitter || manager.socialMedia.facebook || manager.socialMedia.instagram) && (
        <div className={styles.infoSection}>
          <h3>Social Media</h3>
          {renderSocialLinks()}
        </div>
      )}
    </div>
  )

  const renderClientsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.clientsHeader}>
        <h3>Managed Clients ({manager.managedClients.length})</h3>
        <div className={styles.clientsStats}>
          <span className={styles.activeClients}>
            {manager.managedClients.filter(c => c.status === 'active').length} Active
          </span>
          <span className={styles.inactiveClients}>
            {manager.managedClients.filter(c => c.status === 'inactive').length} Inactive
          </span>
        </div>
      </div>
      
      <div className={styles.clientsList}>
        {manager.managedClients.map((client) => (
          <div key={client._id} className={styles.clientCard}>
            <div className={styles.clientInfo}>
              <div className={styles.clientAvatar}>
                {client.name.charAt(0)}
              </div>
              <div className={styles.clientDetails}>
                <h4>{client.name}</h4>
                <div className={styles.clientStatus}>
                  {getStatusIcon(client.status)}
                  <span className={`${styles.statusText} ${styles[client.status]}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <button className={styles.viewClientBtn}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderReviewsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.reviewsHeader}>
        <h3>Client Reviews ({manager.reviews.length})</h3>
        <div className={styles.overallRating}>
          {renderStars(manager.rating)}
          <span className={styles.reviewCount}>Based on {manager.reviews.length} reviews</span>
        </div>
      </div>
      
      <div className={styles.reviewsList}>
        {manager.reviews.map((review, index) => (
          <div key={index} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerAvatar}>
                  {review.reviewer.name.charAt(0)}
                </div>
                <div className={styles.reviewerDetails}>
                  <h4>{review.reviewer.name}</h4>
                  <span className={styles.reviewDate}>{formatDate(review.date)}</span>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className={styles.reviewComment}>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRequestsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.requestsHeader}>
        <h3>Recent Requests ({manager.requests.length})</h3>
        <div className={styles.requestsStats}>
          <span className={styles.pendingRequests}>
            {manager.requests.filter(r => r.status === 'pending').length} Pending
          </span>
          <span className={styles.approvedRequests}>
            {manager.requests.filter(r => r.status === 'approved').length} Approved
          </span>
          <span className={styles.rejectedRequests}>
            {manager.requests.filter(r => r.status === 'rejected').length} Rejected
          </span>
        </div>
      </div>
      
      <div className={styles.requestsList}>
        {manager.requests.map((request, index) => (
          <div key={index} className={styles.requestCard}>
            <div className={styles.requestInfo}>
              <div className={styles.requestAvatar}>
                {request.manager.name.charAt(0)}
              </div>
              <div className={styles.requestDetails}>
                <h4>Request from {request.manager.name}</h4>
                <span className={styles.requestDate}>
                  <Clock size={14} />
                  {formatDate(request.date)}
                </span>
              </div>
            </div>
            <div className={styles.requestStatus}>
              {getStatusIcon(request.status)}
              <span className={`${styles.statusText} ${styles[request.status]}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileWrapper}>
        {/* Header Section */}
        <div className={styles.profileHeader}>
          <div className={styles.profileImageContainer}>
            <img
              src={manager.profilePhoto || "/placeholder.svg"}
              alt={manager.user.name}
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
            <h1 className={styles.profileName}>{manager.user.name}</h1>
            <p className={styles.profileTitle}>{manager.department} Manager</p>
            <div className={styles.profileRating}>
              {renderStars(manager.rating)}
            </div>
            <div className={styles.profileMeta}>
              <span className={styles.experience}>
                <Award size={16} />
                {manager.experience} years experience
              </span>
              <span className={styles.joinDate}>
                <Calendar size={16} />
                Joined {formatDate(manager.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={16} />
            Overview
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'clients' ? styles.active : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={16} />
            Clients ({manager.managedClients.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={16} />
            Reviews ({manager.reviews.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'requests' ? styles.active : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <AlertCircle size={16} />
            Requests ({manager.requests.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContainer}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'clients' && renderClientsTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'requests' && renderRequestsTab()}
        </div>
      </div>
    </div>
  )
}
