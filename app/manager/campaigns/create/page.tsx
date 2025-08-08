"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import styles from "../../../../styling/createCampaign.module.css"
import { ArrowLeft, Plus, X, User, Loader2 } from "lucide-react"
import Link from "next/link"
import API_ROUTES from "@/app/apiRoutes"
import SearchClients from "@/components/clientSearch"

interface Client {
  _id: string
  name: string
  description?: string
  industry?: string
  contactPerson?: {
    name?: string
    email?: string
    phone?: string
  }
  profilePhoto?: string
  tags?: string[]
  status: "active" | "inactive"
}

interface SocialAccount {
  _id: string
  platform: string
  accountName: string
  accountId: string
  profilePicture?: string
  status: 'connected' | 'disconnected' | 'error'
  followersCount?: number
  postCount?: number
  description?: string
  createdAt: string
}

interface CampaignForm {
  name: string
  objective: string
  startDate: string
  endDate: string
  targetAudience: {
    ageMin: number
    ageMax: number
    gender: string
    interests: string[]
  }
  budget: number
  location: string
  platforms: string[]
  accounts: { [platform: string]: string }
}

const CreateCampaignPage = () => {
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [loadingSocialAccounts, setLoadingSocialAccounts] = useState(false)
  const [socialAccountsError, setSocialAccountsError] = useState<string | null>(null)
  const [form, setForm] = useState<CampaignForm>({
    name: "",
    objective: "",
    startDate: "",
    endDate: "",
    targetAudience: {
      ageMin: 18,
      ageMax: 65,
      gender: "all",
      interests: [],
    },
    budget: 0,
    location: '',
    platforms: [],
    accounts: {},
  })
  const [newInterest, setNewInterest] = useState("")

  const objectives = [
    "Brand Awareness",
    "Traffic",
    "Engagement",
    "App Installs",
    "Video Views",
    "Lead Generation",
    "Conversions",
  ]

  const availablePlatforms = ["Facebook", "Instagram", "Google Ads", "YouTube", "Twitter", "LinkedIn", "TikTok"]

  // Fetch social accounts when client is selected
  const fetchSocialAccounts = async (clientId: string) => {
    setLoadingSocialAccounts(true)
    setSocialAccountsError(null)
    
    try {
      const response = await fetch(API_ROUTES.SOCIAL_ACCOUNTS.CLIENT(clientId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          setSocialAccounts([])
          setSocialAccountsError("No social accounts found for this client")
        } else {
          const error = await response.json()
          throw new Error(error.message || 'Failed to fetch social accounts')
        }
      } else {
        const data = await response.json()
        setSocialAccounts(data.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching social accounts:', error)
      setSocialAccountsError(error.message || 'Failed to fetch social accounts')
      setSocialAccounts([])
    } finally {
      setLoadingSocialAccounts(false)
    }
  }

  // Get social accounts for a specific platform
  const getAccountsForPlatform = (platform: string) => {
    const platformLower = platform.toLowerCase().replace(/\s+/g, '')
    return socialAccounts.filter(account => 
      account.platform.toLowerCase() === platformLower && account.status === 'connected'
    )
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setShowClientSearch(false)
    
    // Reset form accounts when client changes
    setForm(prev => ({
      ...prev,
      accounts: {},
      platforms: []
    }))
    
    // Fetch social accounts for the selected client
    fetchSocialAccounts(client._id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClient) {
      alert("Please select a client before creating the campaign")
      return
    }

    const payload = {
      name: form.name,
      objective: form.objective.toLowerCase().replace(/\s+/g, ''),
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      targetAudience: {
        ageRange: {
          min: form.targetAudience.ageMin,
          max: form.targetAudience.ageMax,
        },
        genders: [form.targetAudience.gender],
        interests: form.targetAudience.interests,
        locations: [form.location],
        languages: [],
      },
      budget: form.budget,
      platforms: form.platforms.map((platform) => ({
        platform: platform.toLowerCase().replace(/\s+/g, ''),
        account: form.accounts[platform],
        dailyBudget: Math.floor(form.budget / form.platforms.length), // Distribute budget across platforms
      })),
      client: selectedClient._id,
    }

    try {
      const res = await fetch(API_ROUTES.AD_CAMPAIGNS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create campaign')
      }

      const data = await res.json()
      console.log('Campaign created:', data)
      router.push('/manager/campaigns')
    } catch (err: any) {
      alert(err.message)
      console.error(err)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !form.targetAudience.interests.includes(newInterest.trim())) {
      setForm((prev) => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          interests: [...prev.targetAudience.interests, newInterest.trim()],
        },
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        interests: prev.targetAudience.interests.filter((i) => i !== interest),
      },
    }))
  }

  const togglePlatform = (platform: string) => {
    setForm((prev) => {
      const isRemoving = prev.platforms.includes(platform)
      const newPlatforms = isRemoving
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform]
      
      // Remove account selection if platform is unchecked
      const newAccounts = isRemoving
        ? Object.fromEntries(Object.entries(prev.accounts).filter(([key]) => key !== platform))
        : prev.accounts

      return {
        ...prev,
        platforms: newPlatforms,
        accounts: newAccounts,
      }
    })
  }

  return (
    <div className={styles.createCampaignPage}>
      <div className={styles.header}>
         <h1>Create New Campaign</h1>
        <Link href="/manager/campaigns" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Campaigns
        </Link>
       
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2>Client Selection</h2>
          <div className={styles.formGroup}>
            <label>Selected Client</label>
            {selectedClient ? (
              <div className={styles.selectedClient}>
                <div className={styles.clientInfo}>
                  <User size={20} />
                  <div>
                    <strong>{selectedClient.name}</strong>
                    {selectedClient.industry && <span> - {selectedClient.industry}</span>}
                    {selectedClient.contactPerson?.email && (
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {selectedClient.contactPerson.email}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowClientSearch(true)}
                  className={styles.changeClientButton}
                >
                  Change Client
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setShowClientSearch(true)}
                className={styles.selectClientButton}
              >
                Select Client
              </button>
            )}
          </div>

          {showClientSearch && (
            <div className={styles.clientSearchModal}>
              <div className={styles.clientSearchContent}>
                <div className={styles.clientSearchHeader}>
                  <h3>Select a Client</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowClientSearch(false)}
                    className={styles.closeButton}
                  >
                    <X size={20} />
                  </button>
                </div>
                <SearchClients onClientSelect={handleClientSelect} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Campaign Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Objective</label>
              <select
                value={form.objective}
                onChange={(e) => setForm((prev) => ({ ...prev, objective: e.target.value }))}
                required
              >
                <option value="">Select objective</option>
                {objectives.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Budget & Location</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="budget">Daily Budget ($)</label>
              <input
                type="number"
                id="budget"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                placeholder="e.g. 50"
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Target Location</label>
              <input
                type="text"
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. United States"
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Target Audience</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Age Range</label>
              <div className={styles.ageRange}>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={form.targetAudience.ageMin}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, ageMin: Number.parseInt(e.target.value) },
                    }))
                  }
                />
                <span>to</span>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={form.targetAudience.ageMax}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, ageMax: Number.parseInt(e.target.value) },
                    }))
                  }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Gender</label>
              <select
                value={form.targetAudience.gender}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    targetAudience: { ...prev.targetAudience, gender: e.target.value },
                  }))
                }
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Interests</label>
            <div className={styles.interestInput}>
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add interest..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              />
              <button type="button" onClick={addInterest} className={styles.addButton}>
                <Plus size={16} />
              </button>
            </div>
            <div className={styles.interestTags}>
              {form.targetAudience.interests.map((interest) => (
                <span key={interest} className={styles.interestTag}>
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Platforms & Accounts</h2>
          
          {!selectedClient && (
            <div className={styles.warningMessage}>
              <p>Please select a client first to see available social accounts.</p>
            </div>
          )}

          {selectedClient && loadingSocialAccounts && (
            <div className={styles.loadingMessage}>
              <Loader2 size={20} className="animate-spin" />
              <span>Loading social accounts...</span>
            </div>
          )}

          {selectedClient && socialAccountsError && (
            <div className={styles.errorMessage}>
              <p>{socialAccountsError}</p>
            </div>
          )}

          {selectedClient && !loadingSocialAccounts && (
            <div className={styles.platformGrid}>
              {availablePlatforms.map((platform) => {
                const platformAccounts = getAccountsForPlatform(platform)
                const hasPlatformAccounts = platformAccounts.length > 0
                
                return (
                  <div key={platform} className={styles.platformOption}>
                    <label className={`${styles.checkbox} ${!hasPlatformAccounts ? styles.disabled : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.platforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                        disabled={!hasPlatformAccounts}
                      />
                      <span className={styles.checkmark}></span>
                      {platform}
                      {!hasPlatformAccounts && <span className={styles.noAccounts}>(No accounts)</span>}
                    </label>
                    
                    {form.platforms.includes(platform) && hasPlatformAccounts && (
                      <select
                        value={form.accounts[platform] || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            accounts: { ...prev.accounts, [platform]: e.target.value },
                          }))
                        }
                        className={styles.accountSelect}
                        required
                      >
                        <option value="">Select account</option>
                        {platformAccounts.map((account) => (
                          <option key={account._id} value={account.accountId}>
                            {account.accountName}
                            {account.followersCount && ` (${account.followersCount.toLocaleString()} followers)`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <Link href="/campaigns" className={styles.cancelButton}>
            Cancel
          </Link>
          <button 
            type="submit" 
            className="themeButton"
            disabled={!selectedClient || form.platforms.length === 0}
          >
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaignPage