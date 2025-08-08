"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../../styling/campaigns.module.css";
import { Plus, Search, Eye, Edit, Pause, Play, Archive } from "lucide-react";
import SearchBar from "@/components/searchbar";
import Table, { TableColumn } from "@/components/table";
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

  // Table columns definition
  const columns: TableColumn[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value, row) => <span className={styles.campaignName}>{value}</span>,
    },
    {
      key: "objective",
      label: "Objective",
      sortable: true,
      render: (value) => getObjectiveLabel(value),
    },
    {
      key: "platforms",
      label: "Platforms",
      render: (value) => (
        <div className={styles.platforms}>
          {Array.isArray(value)
            ? value.map((platform: any, idx: number) => (
                <span key={idx} className={styles.platformTag}>
                  {platform.platform}
                </span>
              ))
            : null}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      render: (value) => (
        <span
          className={styles.statusBadge}
          style={{ backgroundColor: getStatusColor(value) }}
        >
          {value}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      render: (_: any, row: AdCampaign) => (
        <div className={styles.actions}>
          <Link href={`campaigns/${row._id}`} className={styles.actionButton}>
            <Eye size={16} />
          </Link>
          <Link href={`campaigns/${row._id?.toString()}`} className={styles.actionButton}>
            <Edit size={16} />
          </Link>
          {row.status === "active" && (
            <button
              onClick={() => handlePauseCampaign(row._id!.toString())}
              className={styles.actionButton}
              title="Pause Campaign"
            >
              <Pause size={16} />
            </button>
          )}
          {row.status === "paused" && (
            <button
              onClick={() => handleResumeCampaign(row._id!.toString())}
              className={styles.actionButton}
              title="Resume Campaign"
            >
              <Play size={16} />
            </button>
          )}
          {row.status !== "archived" && (
            <button
              onClick={() => handleArchiveCampaign(row._id!.toString())}
              className={styles.actionButton}
              title="Archive Campaign"
            >
              <Archive size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.campaignsPage}>
      <div className={styles.header}>
        <h1>Campaigns</h1>
        <button className="themeButton">
          <Link href="campaigns/create" >
            <Plus size={20} />
            Create Campaign
          </Link>
        </button>
      </div>

      <div className={styles.filters}>
        <SearchBar
          placeholder="Search campaigns..."
          onSearch={setSearchTerm}
          className={styles.searchBox}
        />

        <div className={styles.tabs}>
          {[
            "All Status",
            "Active",
            "Paused",
            "Completed",
            "Draft",
            "Archived"
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab === "All Status" ? "all" : tab.toLowerCase())}
              className={`${styles.tab} ${statusFilter === (tab === "All Status" ? "all" : tab.toLowerCase()) ? styles.tabActive : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          data={filteredCampaigns}
          columns={columns}
          pageSize={10}
          searchable={false}
          emptyMessage="No campaigns found"
        />
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
