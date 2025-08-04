"use client"

import { useState, useEffect } from "react"
import { User, Phone, Building, Globe, Star, Calendar, Users, MessageSquare, ExternalLink, Mail, MapPin, Award, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Plus } from 'lucide-react'
import styles from "../../../styling/ManagerProfile.module.css"
import API_ROUTES from "@/app/apiRoutes"

interface Manager {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
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
    date: string;
    rating: number;
    comment: string;
  }>;
  requests: Array<{
    _id: string;
    manager: {
      name: string;
    };
    date: string;
    status: string;
  }>;
}

type Props = {
  id: string
}

interface CurrentUser {
  id: string;
  name: string;
  // Add other user properties you need
}

export default function ManagerProfilePage({ id }: Props) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' >('overview')
  const [manager, setManager] = useState<Manager | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  // Add this state to store user names for reviews
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
  if (!id) return
  
  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch current user first
      const userRes = await fetch(API_ROUTES.AUTH.ME, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (userRes.ok) {
        const userData = await userRes.json()
        // Check if the data is nested under a 'data' property
        const user = userData.data || userData;
        
        setCurrentUser({
          id: user._id,
          name: user.name // This should be the logged-in user's name
        })
      }
      
      // Then fetch manager data
      await fetchManager()
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [id])


  const fetchManager = async () => {
  try {
    const res = await fetch(API_ROUTES.MANAGERS.GET_ONE(id), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    const managerData = data.data;

    // Fetch names for all reviewers
    const reviewsWithNames = await Promise.all(
      managerData.reviews.map(async (review: any) => {
        let reviewerName = 'User';
        let reviewerId = null;

        if (typeof review.reviewer === 'string') {
          reviewerId = review.reviewer;
          try {
            const userRes = await fetch(API_ROUTES.USERS.GET_ONE(review.reviewer), {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              reviewerName = userData.data?.name || userData.name || 'User';
            }
          } catch (err) {
            console.error("Failed to fetch user:", err);
          }
        } else if (review.reviewer?._id) {
          reviewerId = review.reviewer._id;
          reviewerName = review.reviewer.name || 'User';
        }

        return {
          ...review,
          reviewerName,
          reviewerId
        };
      })
    );

    setManager({
      ...managerData,
      reviews: reviewsWithNames
    });
  } catch (err) {
    console.error("Failed to load manager:", err);
  }
};

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingReviewId ? 'PUT' : 'POST';
      const url = editingReviewId
        ? API_ROUTES.MANAGERS.ADD_OR_UPDATE_REVIEW(id, editingReviewId)
        : API_ROUTES.MANAGERS.ADD_OR_UPDATE_REVIEW(id);

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Review submission failed');
      }

      await fetchManager();
      setShowReviewForm(false);
      setEditingReviewId(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error("Review submission error:", err);
      alert(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!reviewId) {
      console.error("Cannot delete review: Review ID is undefined");
      alert("Cannot delete review: Invalid review ID");
      return;
    }

    if (!id) {
      console.error("Cannot delete review: Manager ID is undefined");
      alert("Cannot delete review: Invalid manager ID");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this review?");
    if (!confirmed) return;

    try {
      const response = await fetch(API_ROUTES.MANAGERS.DELETE_REVIEW(id, reviewId), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review');
      }

      await fetchManager();
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err instanceof Error ? err.message : "Failed to delete review");
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReviewId(review._id)
    setReviewForm({
      rating: review.rating,
      comment: review.comment
    })
    setShowReviewForm(true)
  }

  if (loading) return <div>Loading...</div>
  if (!manager) return <div>Manager not found</div>

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

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${star}`}
            size={16}
            className={`${styles.star} ${star <= rating ? styles.starFilled : ''} ${interactive ? styles.interactiveStar : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
        {!interactive && <span className={styles.ratingText}>({rating.toFixed(1)})</span>}
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
          const url = manager.socialMedia[platform.key as keyof typeof manager.socialMedia]
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

  const renderReviewsTab = () => {
    if (!manager) return null
    
    return (
      <div className={styles.tabContent}>
        <div className={styles.reviewsHeader}>
          <h3>Client Reviews ({manager.reviews.length})</h3>
          <div className={styles.overallRating}>
            {renderStars(manager.rating)}
            <span className={styles.reviewCount}>Based on {manager.reviews.length} reviews</span>
          </div>
          <button 
            className={styles.addReviewButton}
            onClick={() => setShowReviewForm(true)}
          >
            <Plus size={16} />
            Add Review
          </button>
        </div>

        {showReviewForm && (
          <div className={styles.reviewFormContainer}>
            <h4>{editingReviewId ? 'Edit Review' : 'Add Review'}</h4>
            <form onSubmit={handleReviewSubmit}>
              <div className={styles.formGroup}>
                <label>Rating</label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm({...reviewForm, rating})
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {editingReviewId ? 'Update Review' : 'Submit Review'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowReviewForm(false)
                    setEditingReviewId(null)
                    setReviewForm({ rating: 5, comment: '' })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
             <div className={styles.reviewsList}>
        {manager.reviews.map((review: any) => {
          const reviewerName = review.reviewerName || 'User';
          const isCurrentUserReview = review.reviewerId === currentUser?.id;

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
                {isCurrentUserReview && (
                  <div className={styles.reviewActions}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEditReview(review)}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {renderStars(review.rating)}
              <p className={styles.reviewComment}>{review.comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};


  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileWrapper}>
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
            Reviews ({manager.reviews.length})
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