"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import styles from "./CreateCampaign.module.css"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import API_ROUTES from "@/app/apiRoutes"

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
  platforms: string[]
  accounts: { [platform: string]: string }
}

const CreateCampaignPage = () => {
  const router = useRouter()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would make an API call to create the campaign
    console.log("Creating campaign:", form)
    router.push("/campaigns")
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
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  return (
    <div className={styles.createCampaignPage}>
      <div className={styles.header}>
        <Link href="/campaigns" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Campaigns
        </Link>
        <h1>Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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
          <h2>Platforms</h2>
          <div className={styles.platformGrid}>
            {availablePlatforms.map((platform) => (
              <div key={platform} className={styles.platformOption}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  <span className={styles.checkmark}></span>
                  {platform}
                </label>
                {form.platforms.includes(platform) && (
                  <select
                    value={form.accounts[platform] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        accounts: { ...prev.accounts, [platform]: e.target.value },
                      }))
                    }
                    className={styles.accountSelect}
                  >
                    <option value="">Select account</option>
                    <option value="account1">Account 1</option>
                    <option value="account2">Account 2</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formActions}>
          <Link href="/campaigns" className={styles.cancelButton}>
            Cancel
          </Link>
          <button type="submit" className={styles.submitButton}>
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaignPage
