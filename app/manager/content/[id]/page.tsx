'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calendar, Hash, BarChart3, Eye, Heart, MessageCircle, Share, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import styles from '@/styling/postDetails.module.css'
import API_ROUTES from '@/app/apiRoutes'

interface MediaItem {
  url: string
  publicId: string
  mediaType: 'image' | 'video' | 'gif'
  caption?: string
}

interface PlatformData {
  platform: string
  account?: string
  postId?: string
  status: 'pending' | 'published' | 'failed'
  publishedAt?: string
  url?: string
  analytics?: {
    likes?: number
    comments?: number
    shares?: number
    reach?: number
    impressions?: number
    engagementRate?: number
  }
}

interface Post {
  _id: string
  title: string
  content: string
  media: MediaItem[]
  hashtags: string[]
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  platforms: PlatformData[]
  isSimulated: boolean
  client: {
    _id: string
    user: {
      name: string
    }
  }
  Manager: {
    _id: string
    user: {
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

export default function PostDetailsPage() {
  const params = useParams()
  const id = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  useEffect(() => {
    if (!id) return

    const fetchPost = async () => {
      try {
        const response = await fetch(API_ROUTES.POSTS.GET_ONE(id), {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success && data.data) {
          setPost(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch post')
        }
      } catch (err: any) {
        console.error('Failed to load post:', err)
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className={styles.statusIconSuccess} />
      case 'failed':
        return <XCircle className={styles.statusIconError} />
      case 'scheduled':
        return <Clock className={styles.statusIconWarning} />
      case 'draft':
        return <AlertCircle className={styles.statusIconInfo} />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const nextMedia = () => {
    if (post?.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1)
    }
  }

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1)
    }
  }

  const renderMediaSlider = () => {
    if (!post?.media || post.media.length === 0) return null

    const currentMedia = post.media[currentMediaIndex]

    return (
      <div className={styles.mediaSlider}>
        <div className={styles.mediaContainer}>
          {currentMedia.mediaType === 'video' ? (
            <video
              src={currentMedia.url}
              controls
              className={styles.mediaItem}
              poster={currentMedia.url}
            />
          ) : (
            <img
              src={currentMedia.url || "/placeholder.svg"}
              alt={currentMedia.caption || `Media ${currentMediaIndex + 1}`}
              className={styles.mediaItem}
            />
          )}
          
          {post.media.length > 1 && (
            <>
              <button
                className={`${styles.mediaNav} ${styles.mediaPrev}`}
                onClick={prevMedia}
                disabled={currentMediaIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className={`${styles.mediaNav} ${styles.mediaNext}`}
                onClick={nextMedia}
                disabled={currentMediaIndex === post.media.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
        
        {currentMedia.caption && (
          <p className={styles.mediaCaption}>{currentMedia.caption}</p>
        )}
        
        {post.media.length > 1 && (
          <div className={styles.mediaIndicators}>
            {post.media.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentMediaIndex ? styles.indicatorActive : ''}`}
                onClick={() => setCurrentMediaIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderPlatformAnalytics = (platform: PlatformData) => {
    if (!platform.analytics) return null

    const { likes, comments, shares, reach, impressions, engagementRate } = platform.analytics

    return (
      <div className={styles.analyticsGrid}>
        {likes !== undefined && (
          <div className={styles.analyticItem}>
            <Heart size={16} />
            <span>{likes.toLocaleString()}</span>
          </div>
        )}
        {comments !== undefined && (
          <div className={styles.analyticItem}>
            <MessageCircle size={16} />
            <span>{comments.toLocaleString()}</span>
          </div>
        )}
        {shares !== undefined && (
          <div className={styles.analyticItem}>
            <Share size={16} />
            <span>{shares.toLocaleString()}</span>
          </div>
        )}
        {reach !== undefined && (
          <div className={styles.analyticItem}>
            <Eye size={16} />
            <span>{reach.toLocaleString()}</span>
          </div>
        )}
        {impressions !== undefined && (
          <div className={styles.analyticItem}>
            <BarChart3 size={16} />
            <span>{impressions.toLocaleString()}</span>
          </div>
        )}
        {engagementRate !== undefined && (
          <div className={styles.analyticItem}>
            <span className={styles.engagementRate}>
              {(engagementRate * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading post details...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Failed to load post</h2>
          <p className={styles.errorText}>{error || 'Post not found'}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animation">
    <div className={styles.container}>
      <div className={styles.postWrapper}>
        {/* Header */}
        <div className={styles.postHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.postTitle}>{post.title}</h1>
            <div className={styles.statusBadge}>
              {getStatusIcon(post.status)}
              <span className={`${styles.statusText} ${styles[post.status]}`}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className={styles.postMeta}>
            <div className={styles.metaItem}>
              <Calendar size={16} />
              <span>Scheduled: {formatDate(post.scheduledTime)}</span>
            </div>
            {post.isSimulated && (
              <div className={styles.simulatedBadge}>
                <span>Simulated</span>
              </div>
            )}
          </div>
        </div>

        {/* Media Slider */}
        {renderMediaSlider()}

        {/* Content */}
        <div className={styles.contentSection}>
          <h3 className={styles.sectionTitle}>Content</h3>
          <p className={styles.postContent}>{post.content}</p>
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className={styles.hashtagsSection}>
            <h3 className={styles.sectionTitle}>Hashtags</h3>
            <div className={styles.hashtags}>
              {post.hashtags.map((hashtag, index) => (
                <span key={index} className={styles.hashtag}>
                  <Hash size={14} />
                  {hashtag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Platforms */}
        <div className={styles.platformsSection}>
          <h3 className={styles.sectionTitle}>Platforms</h3>
          <div className={styles.platformsList}>
            {post.platforms.map((platform, index) => (
              <div key={index} className={styles.platformCard}>
                <div className={styles.platformHeader}>
                  <div className={styles.platformInfo}>
                    <h4 className={styles.platformName}>
                      {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                    </h4>
                    <div className={styles.platformStatus}>
                      {getStatusIcon(platform.status)}
                      <span className={`${styles.statusText} ${styles[platform.status]}`}>
                        {platform.status.charAt(0).toUpperCase() + platform.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {platform.publishedAt && (
                    <span className={styles.publishedDate}>
                      Published: {formatDate(platform.publishedAt)}
                    </span>
                  )}
                </div>
                
                {platform.url && (
                  <a 
                    href={platform.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.platformUrl}
                  >
                    View Post
                  </a>
                )}
                
                {renderPlatformAnalytics(platform)}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className={styles.footerInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Client:</span>
            <span className={styles.infoValue}>{post.client?.user?.name || 'Unknown'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Manager:</span>
            <span className={styles.infoValue}>{post.Manager?.user?.name || 'Unknown'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created:</span>
            <span className={styles.infoValue}>{formatDate(post.createdAt)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Updated:</span>
            <span className={styles.infoValue}>{formatDate(post.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
