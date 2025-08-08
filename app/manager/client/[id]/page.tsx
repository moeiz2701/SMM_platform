'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { User, Phone, Mail, MapPin, Building, CreditCard, Calendar, Tag, CheckCircle, XCircle, Clock, AlertCircle, Shield, Users } from 'lucide-react'
import styles from '@/styling/clientDetails.module.css'
import API_ROUTES from '@/app/apiRoutes'

interface ContactPerson {
  name?: string
  email?: string
  phone?: string
}

interface BillingInfo {
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface PaymentInfo {
  stripePaymentMethodId?: string
  cardLast4?: string
  cardBrand?: string
  cardExpMonth?: number
  cardExpYear?: number
  cardHolderName?: string
  isDefault?: boolean
}

interface Request {
  _id: string
  manager: {
    _id: string
    profilePhoto?: string
    user: {
      name: string
      email: string
    }
  }
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

interface Client {
  _id: string
  name: string
  description?: string
  industry?: string
  contactPerson?: ContactPerson
  billingInfo?: BillingInfo
  paymentInfo?: PaymentInfo
  stripeCustomerId?: string
  status: 'active' | 'inactive'
  tags: string[]
  profilePhoto?: string
  createdAt: string
  user: {
    _id: string
    name: string
    email: string
  }
  manager?: {
    _id: string
    profilePhoto?: string
    user: {
      name: string
      email: string
    }
  }
  requests: Request[]
}

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!clientId) return

    const fetchClient = async () => {
      try {
        const response = await fetch(API_ROUTES.CLIENTS.GET(clientId), {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success && data.data) {
          setClient(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch client')
        }
      } catch (err: any) {
        console.error('Failed to load client:', err)
        setError(err.message || 'Failed to load client')
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className={styles.statusIconSuccess} />
      case 'inactive':
      case 'rejected':
        return <XCircle className={styles.statusIconError} />
      case 'pending':
        return <Clock className={styles.statusIconWarning} />
      default:
        return <AlertCircle className={styles.statusIconInfo} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCardBrand = (brand?: string) => {
    if (!brand) return 'Unknown'
    return brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  const renderContactInfo = () => {
    if (!client?.contactPerson) return null

    const { name, email, phone } = client.contactPerson

    return (
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Contact Person</h3>
        <div className={styles.infoGrid}>
          {name && (
            <div className={styles.infoItem}>
              <User size={16} />
              <span>{name}</span>
            </div>
          )}
          {email && (
            <div className={styles.infoItem}>
              <Mail size={16} />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className={styles.infoItem}>
              <Phone size={16} />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderBillingInfo = () => {
    if (!client?.billingInfo) return null

    const { address, city, state, zipCode, country } = client.billingInfo

    if (!address && !city && !state && !zipCode && !country) return null

    return (
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Billing Information</h3>
        <div className={styles.addressCard}>
          <MapPin size={16} className={styles.addressIcon} />
          <div className={styles.addressDetails}>
            {address && <div className={styles.addressLine}>{address}</div>}
            <div className={styles.addressLine}>
              {[city, state, zipCode].filter(Boolean).join(', ')}
            </div>
            {country && <div className={styles.addressLine}>{country}</div>}
          </div>
        </div>
      </div>
    )
  }

  const renderPaymentInfo = () => {
    if (!client?.paymentInfo) return null

    const { cardLast4, cardBrand, cardExpMonth, cardExpYear, cardHolderName, isDefault } = client.paymentInfo

    if (!cardLast4) return null

    return (
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Payment Information</h3>
        <div className={styles.paymentCard}>
          <div className={styles.paymentHeader}>
            <div className={styles.paymentIcon}>
              <CreditCard size={20} />
            </div>
            <div className={styles.paymentDetails}>
              <div className={styles.cardInfo}>
                <span className={styles.cardBrand}>{formatCardBrand(cardBrand)}</span>
                <span className={styles.cardNumber}>•••• •••• •••• {cardLast4}</span>
              </div>
              {cardExpMonth && cardExpYear && (
                <div className={styles.cardExpiry}>
                  Expires {cardExpMonth.toString().padStart(2, '0')}/{cardExpYear}
                </div>
              )}
            </div>
            {isDefault && (
              <div className={styles.defaultBadge}>
                <Shield size={14} />
                <span>Default</span>
              </div>
            )}
          </div>
          {cardHolderName && (
            <div className={styles.cardHolder}>
              <span className={styles.cardHolderLabel}>Cardholder:</span>
              <span className={styles.cardHolderName}>{cardHolderName}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRequests = () => {
    if (!client?.requests || client.requests.length === 0) return null

    return (
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Recent Requests ({client.requests.length})</h3>
        <div className={styles.requestsList}>
          {client.requests.slice(0, 5).map((request) => (
            <div key={request._id} className={styles.requestCard}>
              <div className={styles.requestInfo}>
                <img
                  src={request.manager?.profilePhoto || "/placeholder.svg"}
                  alt={request.manager?.user?.name || "Manager"}
                  className={styles.requestAvatar}
                />
                <div className={styles.requestDetails}>
                  <h4 className={styles.requestName}>{request.manager?.user?.name || "Unknown"}</h4>
                  <p className={styles.requestEmail}>{request.manager?.user?.email || "Unknown"}</p>
                  <span className={styles.requestDate}>
                    <Calendar size={14} />
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
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading client profile...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Failed to load client</h2>
          <p className={styles.errorText}>{error || 'Client not found'}</p>
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
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        {/* Header Section */}
        <div className={styles.profileHeader}>
          <div className={styles.profileImageContainer}>
            <img
              src={client.profilePhoto || "/placeholder.svg"}
              alt={client.name}
              className={styles.profileImage}
            />
            <div className={styles.statusBadge}>
              {getStatusIcon(client.status)}
              <span className={`${styles.statusText} ${styles[client.status]}`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{client.name}</h1>
            {client.industry && (
              <p className={styles.profileIndustry}>
                <Building size={16} />
                {client.industry}
              </p>
            )}
            {client.description && (
              <p className={styles.profileDescription}>{client.description}</p>
            )}
            
            <div className={styles.profileMeta}>
              <span className={styles.joinDate}>
                <Calendar size={16} />
                Client since {formatDate(client.createdAt)}
              </span>
              {client.manager && client.manager.user && (
                <span className={styles.managerInfo}>
                  <Users size={16} />
                  Managed by {client.manager.user.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {client.tags && client.tags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.sectionTitle}>Tags</h3>
            <div className={styles.tags}>
              {client.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Account Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <User size={16} />
              <span>{client.user.name}</span>
            </div>
            <div className={styles.infoItem}>
              <Mail size={16} />
              <span>{client.user.email}</span>
            </div>
            {client.stripeCustomerId && (
              <div className={styles.infoItem}>
                <Shield size={16} />
                <span>Stripe Customer ID: {client.stripeCustomerId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {renderContactInfo()}

        {/* Billing Information */}
        {renderBillingInfo()}

        {/* Payment Information */}
        {renderPaymentInfo()}

        {/* Recent Requests */}
       
      </div>
    </div>
  )
}
