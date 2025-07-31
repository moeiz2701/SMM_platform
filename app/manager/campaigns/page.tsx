"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../../styling/campaigns.module.css";
import { Plus, Search, Eye, Edit, Pause, Play, Archive } from "lucide-react";
import API_ROUTES from "@/app/apiRoutes";
import type { AdCampaign } from "@/types/adCompaign";

const CampaignsPage = () => {
 const [campaigns, setCampaigns] = useState<AdCampaign[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
  try {
    setLoading(true);
    const res = await fetch(API_ROUTES.AD_CAMPAIGNS.GET_ALL, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    const campaignsArray = Array.isArray(data?.data) ? data.data : [];

    setCampaigns(campaignsArray);
  } catch (err: any) {
    setError("Failed to fetch campaigns");
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};


  const handlePauseCampaign = async (id: string) => {
  try {
    await fetch(API_ROUTES.AD_CAMPAIGNS.PAUSE(id), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign._id?.toString() === id ? { ...campaign, status: "paused" } : campaign
      )
    );
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to pause campaign");
  }
};

const handleResumeCampaign = async (id: string) => {
  try {
    await fetch(API_ROUTES.AD_CAMPAIGNS.RESUME(id), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign._id?.toString() === id ? { ...campaign, status: "active" } : campaign
      )
    );
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to resume campaign");
  }
};

const handleArchiveCampaign = async (id: string) => {
  if (!confirm("Are you sure you want to archive this campaign?")) return;

  try {
    await fetch(API_ROUTES.AD_CAMPAIGNS.ARCHIVE(id), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign._id?.toString() === id ? { ...campaign, status: "archived" } : campaign
      )
    );
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to archive campaign");
  }
};


  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "paused":
        return "#f59e0b";
      case "completed":
        return "#6b7280";
      case "draft":
        return "#8b5cf6";
      case "archived":
        return "#374151";
      default:
        return "#6b7280";
    }
  };

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      awareness: "Brand Awareness",
      traffic: "Traffic",
      engagement: "Engagement",
      leads: "Lead Generation",
      sales: "Sales",
      conversions: "Conversions",
    };
    return labels[objective] || objective;
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles.campaignsPage}>
        <div className={styles.loading}>Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.campaignsPage}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchCampaigns} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.campaignsPage}>
      <div className={styles.header}>
        <h1>Campaigns</h1>
        <Link href="campaigns/create" className={styles.createButton}>
          <Plus size={20} />
          Create Campaign
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.statusFilter}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.campaignsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Objective</th>
              <th>Platforms</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign._id?.toString()}>
                <td className={styles.campaignName}>{campaign.name}</td>
                <td>{getObjectiveLabel(campaign.objective)}</td>
                <td>
                  <div className={styles.platforms}>
                    {campaign.platforms?.map((platform, index) => (
                      <span key={index} className={styles.platformTag}>
                        {platform.platform}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(campaign.status) }}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
                <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`campaigns/${campaign._id}`}
                      className={styles.actionButton}
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`campaigns/${campaign._id?.toString()}`} 
                      className={styles.actionButton}
                    >
                      <Edit size={16} />
                    </Link>
                    {campaign.status === "active" && (
                      <button
                        onClick={() => handlePauseCampaign(campaign._id!.toString())}
                        className={styles.actionButton}
                        title="Pause Campaign"
                      >
                        <Pause size={16} />
                      </button>
                    )}
                    {campaign.status === "paused" && (
                      <button
                        onClick={() => handleResumeCampaign(campaign._id!.toString())}
                        className={styles.actionButton}
                        title="Resume Campaign"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    {campaign.status !== "archived" && (
                      <button
                        onClick={() => handleArchiveCampaign(campaign._id!.toString())}
                        className={styles.actionButton}
                        title="Archive Campaign"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCampaigns.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No campaigns found</p>
          <Link href="/campaigns/create" className={styles.createButton}>
            <Plus size={20} />
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
