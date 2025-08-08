"use client"

import React, { useEffect, useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import AnalyticsCards from '@/components/AnalyticsCards';
import CalendarWidget from '@/components/CalendarWidget';
import EngagementChart from '@/components/EngagementChart';
import MessagesWidget from '@/components/MessageWidget';
import PendingApprovals from '@/components/PendingApprovals';
import TopPosts from '@/components/TopPosts';
import API_ROUTES from '@/app/apiRoutes';

interface ClientData {
  name: string;
  user?: {
    name: string;
    email: string;
  };
  analytics?: {
    totalEngagement: number;
    reachGrowth: number;
    conversionRate: number;
    roi: number;
  };
}

const Page = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Fetch client profile
        const response = await fetch(API_ROUTES.CLIENTS.ME, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch client data');
        }

        const data = await response.json();
        setClientData(data.data);
      } catch (err) {
        setError('Failed to load client data');
        console.error('Error fetching client data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <HeroBanner 
          clientName={clientData?.name || clientData?.user?.name || 'Welcome'} 
        />
        <AnalyticsCards 
          analytics={{
            totalEngagement: clientData?.analytics?.totalEngagement || 0,
            reachGrowth: clientData?.analytics?.reachGrowth || 0,
            conversionRate: clientData?.analytics?.conversionRate || 0,
            roi: clientData?.analytics?.roi || 0
          }}
        />
        <div className="dashboard-row">
          <CalendarWidget />
          <EngagementChart />
        </div>
        <div className="dashboard-row">
          <MessagesWidget />
          <PendingApprovals />
        </div>
      </div>
    </div>
  )
}

export default Page
