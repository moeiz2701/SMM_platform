"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import styles from "../../../../styling/campaignDetails.module.css"
import { ArrowLeft, Edit, Calendar, Target, Users, Pause, Play, Archive } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import type { AdCampaign } from "@/types/adCompaign"

const CampaignDetailPage = () => {
  const params = useParams()
  const [campaign, setCampaign] = useState<AdCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const campaignId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_ROUTES.AD_CAMPAIGNS.GET_ONE(campaignId!), {
        method: "GET",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch campaign")

      const data = await res.json()
      setCampaign(data?.data || data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch campaign")
      console.error("Error fetching campaign:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateCampaignStatus = async (
    endpoint: string,
    newStatus: "paused" | "active" | "archived"
  ) => {
    if (!campaignId || !campaign) return

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
      })

      if (!res.ok) throw new Error(`Failed to ${newStatus} campaign`)
      setCampaign((prev) => (prev ? { ...prev, status: newStatus } : null))
    } catch (err: any) {
      alert(err.message || `Failed to ${newStatus} campaign`)
    }
  }

  const handlePauseCampaign = async () => {
    if (!campaignId || !campaign) return;

    try {
      const res = await fetch(API_ROUTES.AD_CAMPAIGNS.PAUSE(campaignId), {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to pause campaign");
      setCampaign({ ...campaign, status: "paused" });
    } catch (err: any) {
      alert(err.message || "Failed to pause campaign");
    }
  };

  const handleResumeCampaign = async () => {
    if (!campaignId || !campaign) return;

    try {
      const res = await fetch(API_ROUTES.AD_CAMPAIGNS.RESUME(campaignId), {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to resume campaign");
      setCampaign({ ...campaign, status: "active" });
    } catch (err: any) {
      alert(err.message || "Failed to resume campaign");
    }
  };

  const handleArchiveCampaign = async () => {
    if (!campaignId || !campaign) return;
    if (!confirm("Are you sure you want to archive this campaign?")) return;

    try {
      const res = await fetch(API_ROUTES.AD_CAMPAIGNS.ARCHIVE(campaignId), {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to archive campaign");
      setCampaign({ ...campaign, status: "archived" });
    } catch (err: any) {
      alert(err.message || "Failed to archive campaign");
    }
  };


  if (loading) {
    return <div className={styles.loading}>Loading campaign...</div>
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchCampaign} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  if (!campaign) {
    return <div className={styles.loading}>Campaign not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981"
      case "paused":
        return "#f59e0b"
      case "completed":
        return "#6b7280"
      case "draft":
        return "#8b5cf6"
      case "archived":
        return "#374151"
      default:
        return "#6b7280"
    }
  }

  const getObjectiveLabel = (objective: string) => {
    const labels = {
      awareness: "Brand Awareness",
      traffic: "Traffic",
      engagement: "Engagement",
      leads: "Lead Generation",
      sales: "Sales",
      conversions: "Conversions",
    }
    return labels[objective as keyof typeof labels] || objective
  }

  return (
    <div className={styles.campaignDetailPage}>
      <div className={styles.header}>
        <Link href="/manager/campaigns" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Campaigns
        </Link>
        <div className={styles.titleSection}>
          <h1>{campaign.name}</h1>
          <div className={styles.headerActions}>
            <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(campaign.status) }}>
              {campaign.status}
            </span>
            <div className={styles.actionButtons}>
              <button className="themeButton">
                <Link href={`/campaigns/${campaign._id}/edit`}>
                  <Edit size={16} />
                  Edit Campaign
                </Link>
              </button>
              {campaign.status === "active" && (
                <button onClick={handlePauseCampaign} className={styles.pauseButton}>
                  <Pause size={16} />
                  Pause
                </button>
              )}
              {campaign.status === "paused" && (
                <button onClick={handleResumeCampaign} className={styles.resumeButton}>
                  <Play size={16} />
                  Resume
                </button>
              )}
              {campaign.status !== "archived" && (
                <button onClick={handleArchiveCampaign} className={styles.archiveButton}>
                  <Archive size={16} />
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.overview}>
          <div className={styles.overviewCard}>
            <Calendar size={24} />
            <div>
              <h3>Duration</h3>
              <p>
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className={styles.overviewCard}>
            <Target size={24} />
            <div>
              <h3>Objective</h3>
              <p>{getObjectiveLabel(campaign.objective)}</p>
            </div>
          </div>

          <div className={styles.overviewCard}>
            <Users size={24} />
            <div>
              <h3>Target Audience</h3>
              <p>
                Ages {campaign.targetAudience.ageRange.min}-{campaign.targetAudience.ageRange.max}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.section}>
            <h2>Platforms</h2>
            <div className={styles.platforms}>
              {campaign.platforms.map((platform, index) => (
                <div key={index} className={styles.platformCard}>
                  <h4>{platform.platform}</h4>
                  <div className={styles.platformStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Account ID</span>
                      <span className={styles.statValue}>{platform.account}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Daily Budget</span>
                      <span className={styles.statValue}>${platform.dailyBudget?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Status</span>
                      <span className={styles.statValue}>{platform.status || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Target Audience Details</h2>
            <div className={styles.audienceCard}>
              <div className={styles.audienceDetail}>
                <h4>Demographics</h4>
                <p>
                  Age: {campaign.targetAudience.ageRange.min}-{campaign.targetAudience.ageRange.max}
                </p>
                <p>Genders: {campaign.targetAudience.genders.join(", ") || "Not specified"}</p>
                <p>Languages: {campaign.targetAudience.languages.join(", ")}</p>
              </div>

              {campaign.targetAudience.locations.length > 0 && (
                <div className={styles.audienceDetail}>
                  <h4>Locations</h4>
                  <div className={styles.interestTags}>
                    {campaign.targetAudience.locations.map((location, index) => (
                      <span key={index} className={styles.interestTag}>
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {campaign.targetAudience.interests.length > 0 && (
                <div className={styles.audienceDetail}>
                  <h4>Interests</h4>
                  <div className={styles.interestTags}>
                    {campaign.targetAudience.interests.map((interest, index) => (
                      <span key={index} className={styles.interestTag}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Campaign Information</h2>
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Client ID:</span>
                <span className={styles.infoValue}>{campaign.client}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Manager ID:</span>
                <span className={styles.infoValue}>{campaign.manager}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Created:</span>
                <span className={styles.infoValue}>{new Date(campaign.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Last Updated:</span>
                <span className={styles.infoValue}>{new Date(campaign.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetailPage
