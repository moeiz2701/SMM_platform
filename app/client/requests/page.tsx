'use client';

import React, { useEffect, useState } from 'react';
import style from '../../../styling/request.module.css';
import API_ROUTES from '../../apiRoutes';

interface ManagerUser {
  name: string;
  email: string;
}

interface Manager {
  _id: string;
  profilePhoto?: string;
  user: ManagerUser;
}

interface Request {
  manager: Manager;
  date?: string;
  status?: string;
  _id?: string;
}

const RequestCard = ({ 
  manager, 
  onAccept, 
  disabled 
}: { 
  manager: Manager; 
  onAccept: () => void; 
  disabled: boolean; 
}) => {
  if (!manager || !manager.user) return null;

  const { profilePhoto } = manager;
  const { name, email } = manager.user;

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
          <p>wants to be your manager</p>
        </div>
        <div className={style.requestCardActions}>
          <button
            className={`${style.actionButton} ${style.acceptButton}`}
            onClick={onAccept}
            disabled={disabled}
          >
            {disabled ? 'Processing...' : 'Accept Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestsPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Get current user
        const userRes = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' });
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();
        const userId = userData.data?._id;
        if (!userId) throw new Error('User not found');

        // Get client for this user
        const clientRes = await fetch(`${API_ROUTES.CLIENTS.CREATE}?user=${userId}`, { credentials: 'include' });
        if (!clientRes.ok) throw new Error('Failed to fetch client');
        const clientData = await clientRes.json();
        const client = clientData.data && Array.isArray(clientData.data) && clientData.data.length > 0 ? clientData.data[0] : null;
        if (!client || !client._id) throw new Error('Client not found');

        setClientId(client._id);

        // Get requests for this client
        const reqRes = await fetch(API_ROUTES.CLIENTS.GET_REQUESTS(client._id), { credentials: 'include' });
        console.log(client._id, 'Client ID for requests');
        if (!reqRes.ok) throw new Error('Failed to fetch requests');
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      } catch (e: any) {
        setError(e.message || 'Error fetching requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (managerId: string, requestId?: string) => {
    if (!clientId || !requestId) return;

    setAccepting(managerId);
    setError('');

    try {
      // Delete the request first
      const delRes = await fetch(API_ROUTES.CLIENTS.DELETE_REQUEST(clientId, requestId), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!delRes.ok) throw new Error('Failed to delete request');

      // Assign the manager
      const res = await fetch(API_ROUTES.CLIENTS.ASSIGN_MANAGER(managerId), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to assign manager');

      // Remove the accepted request from the list
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (e: any) {
      setError(e.message || 'Error accepting request');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className={style.pageContainer}>
        <div className={style.pageHeader}>
          <h1 className={style.pageTitle}>Your Requests</h1>
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
          <h1 className={style.pageTitle}>Your Requests</h1>
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
        <h1 className={style.pageTitle}>Your Requests</h1>
        <p className={style.pageSubtitle}>
          {requests.length === 0 
            ? "No pending requests" 
            : `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      <div className={style.requestsContainer}>
        {requests.length === 0 ? (
          <div className={style.emptyState}>
            <div className={style.emptyIcon}>📋</div>
            <h3 className={style.emptyTitle}>No requests found</h3>
            <p className={style.emptyText}>
              You don't have any pending management requests at the moment.
            </p>
          </div>
        ) : (
          <div className={style.requestsList}>
            {requests
              .filter((req) => req.manager && req.manager._id)
              .map((req, idx) => (
                <RequestCard
                  key={req._id || idx}
                  manager={req.manager}
                  onAccept={() => req.manager && req.manager._id && handleAccept(req.manager._id, req._id)}
                  disabled={accepting === req.manager._id}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
