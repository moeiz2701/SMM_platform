'use client';

import React, { useEffect, useState } from 'react';
import style from '../../../styling/request.module.css';
import API_ROUTES from '../../apiRoutes';

interface ClientUser {
  name: string;
  email: string;
}

interface Client {
  _id: string;
  profilePhoto?: string;
  user: ClientUser;
}

interface ManagerRequest {
  Client: Client;
  date?: string;
  status?: string;
  _id?: string;
}

const ManagerRequestCard = ({ 
  client, 
  onAccept,
  onDecline, 
  disabled 
}: { 
  client: Client; 
  onAccept: () => void;
  onDecline: () => void;
  disabled: boolean; 
}) => {
  if (!client || !client.user) return null;

  const { profilePhoto } = client;
  const { name, email } = client.user;

  return (
    <div className={style.requestCard}>
      <img
        src={profilePhoto || '/icons/profile.svg'}
        alt={name}
        className={style.requestCardImg}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
          e.currentTarget.onerror = null; 
          e.currentTarget.src = '/icons/profile.svg'; 
        }}
      />
      <div className={style.requestCardContent}>
        <div className={style.requestCardName}>
          <h1>{name}</h1>
        </div>
        <div className={style.requestCardEmail}>
          <p>{email}</p>
        </div>
        <div className={style.requestCardText}>
          <p>wants you to be their manager</p>
        </div>
        <div className={style.requestCardActions}>
          <button
            className={`${style.actionButton} ${style.acceptButton}`}
            onClick={onAccept}
            disabled={disabled}
          >
            {disabled ? 'Processing...' : 'Accept Request'}
          </button>
          <button
            className={`${style.actionButton} ${style.declineButton}`}
            onClick={onDecline}
            disabled={disabled}
          >
            {disabled ? 'Processing...' : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagerRequestsPage = () => {
  const [requests, setRequests] = useState<ManagerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(API_ROUTES.MANAGERS.MY_REQUESTS, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await response.json();
        console.log('Manager requests API response:', data);
        console.log('Requests array:', data.data);
        setRequests(data.data || []);
      } catch (e: any) {
        setError(e.message || 'Error fetching requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (clientId: string) => {
    setProcessing(clientId);
    setError('');

    try {
      const response = await fetch(API_ROUTES.MANAGERS.ACCEPT_REQUEST(clientId), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove the accepted request from the list
        setRequests(prev => prev.filter(req => req.Client._id !== clientId));
        // You could also show a success message here
        console.log('Request accepted successfully:', data.message);
      } else {
        throw new Error(data.message || 'Failed to accept request');
      }
    } catch (e: any) {
      setError(e.message || 'Error accepting request');
      console.error('Error accepting request:', e);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (clientId: string) => {
    setProcessing(clientId);
    setError('');

    try {
      const response = await fetch(API_ROUTES.MANAGERS.DECLINE_REQUEST(clientId), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to decline request');
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove the declined request from the list
        setRequests(prev => prev.filter(req => req.Client._id !== clientId));
        console.log('Request declined successfully:', data.message);
      } else {
        throw new Error(data.message || 'Failed to decline request');
      }
    } catch (e: any) {
      setError(e.message || 'Error declining request');
      console.error('Error declining request:', e);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className={style.pageContainer}>
        <div className={style.pageHeader}>
          <h1 className={style.pageTitle}>Manager Requests</h1>
        </div>
        <div className={style.loadingContainer}>
          <div className={style.loadingSpinner}></div>
          <p className={style.loadingText}>Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.pageContainer}>
        <div className={style.pageHeader}>
          <h1 className={style.pageTitle}>Manager Requests</h1>
        </div>
        <div className={style.errorContainer}>
          <div className={style.errorIcon}>⚠️</div>
          <p className={style.errorText}>{error}</p>
          <button 
            className={style.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={style.pageContainer}>
      <div className={style.pageHeader}>
        <h1 className={style.pageTitle}>Manager Requests</h1>
        <p className={style.pageSubtitle}>
          {requests.filter(req => req.status === 'pending').length === 0 
            ? "No pending requests" 
            : `${requests.filter(req => req.status === 'pending').length} pending request${requests.filter(req => req.status === 'pending').length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      <div className={style.requestsContainer}>
        {requests.filter(req => req.status === 'pending').length === 0 ? (
          <div className={style.emptyState}>
            <div className={style.emptyIcon}>📋</div>
            <h3 className={style.emptyTitle}>No pending requests found</h3>
            <p className={style.emptyText}>
              You don't have any pending management requests at the moment.
            </p>
          </div>
        ) : (
          <div className={style.requestsList}>
            {requests
              .filter((req) => req.Client && req.Client._id && req.status === 'pending')
              .map((req, idx) => (
                <ManagerRequestCard
                  key={req._id || idx}
                  client={req.Client}
                  onAccept={() => req.Client && req.Client._id && handleAccept(req.Client._id)}
                  onDecline={() => req.Client && req.Client._id && handleDecline(req.Client._id)}
                  disabled={processing === req.Client._id}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRequestsPage;
