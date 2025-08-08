"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import styles from "@/styling/calendar.module.css"
import SearchBar from "../../../components/searchbar"
import { useManager } from "@/contexts/managerContext"
import API_ROUTES from "@/app/apiRoutes"

// Interfaces
interface CalendarContentItem {
  id: string
  title: string
  client: string
  clientId: string
  time: string
  status: "Scheduled" | "Pending" | "Published" | "Draft" | "Failed"
  type: string
  date: string
  content?: string
  tags?: string[]
  media?: MediaItem[]
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  content: CalendarContentItem[]
}

interface MediaItem {
  url: string
  publicId: string
  name: string
  type: string
}

interface CreateContentFormData {
  title: string
  platforms: string[]
  clients: string[]
  content: string
  tags: string[]
  links: Array<{ text: string; url: string }>
  attachments: File[]
  existingMedia: MediaItem[]
  aiEnabled: boolean
  aiInstructions: string
  dueDate: string
  time: string
  status: string
}

interface ValidationErrors {
  [key: string]: string
}

// Constants
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const platformOptions = ["Instagram", "Facebook", "LinkedIn"]
const statusOptions = ["Draft", "Scheduled", "Published", "Failed"]

// Main Component
export default function CalendarPage() {
  // Calendar state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [platformFilter, setPlatformFilter] = useState<string[]>([])
  const [clientFilter, setClientFilter] = useState<string[]>([])
  const [posts, setPosts] = useState<CalendarContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const { manager } = useManager()
  const filterRef = useRef<HTMLDivElement>(null)
  const [previewContent, setPreviewContent] = useState<CalendarContentItem | null>(null)

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [formData, setFormData] = useState<CreateContentFormData>({
    title: "",
    platforms: [],
    clients: [],
    content: "",
    tags: [],
    links: [],
    attachments: [],
    existingMedia: [],
    aiEnabled: false,
    aiInstructions: "",
    dueDate: "",
    time: "",
    status: "Draft",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [currentTag, setCurrentTag] = useState("")
  const [currentLink, setCurrentLink] = useState({ text: "", url: "" })
  const [editingPost, setEditingPost] = useState<CalendarContentItem | null>(null)
  const [clientsData, setClientsData] = useState<{id: string, name: string}[]>([])

  // Fetch clients data
  useEffect(() => {
    if (manager?.managedClients?.length) {
      fetchClientNames(manager.managedClients).then(data => {
        setClientsData(data)
      })
    }
  }, [manager?.managedClients])

  // Fetch posts
  useEffect(() => {
    if (!manager?._id) return

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_ROUTES.POSTS.BY_MANAGER(manager._id), {
          credentials: 'include'
        })
        
        if (!response.ok) throw new Error('Failed to fetch posts')
        
        const data = await response.json()
        
        const transformedPosts = data.data.map((post: any) => ({
          id: post._id,
          title: post.title,
          client: post.client?.name || 'Unknown Client',
          clientId: post.client?._id || '',
          time: new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: post.status.charAt(0).toUpperCase() + post.status.slice(1),
          type: post.platforms?.[0]?.platform || 'Social Media',
          date: new Date(post.scheduledTime).toISOString().split('T')[0],
          content: post.content,
          tags: post.hashtags || [],
          media: post.media?.map((m: any) => ({
            url: m.url,
            publicId: m.publicId,
            name: m.caption || 'media',
            type: m.mediaType === 'image' ? 'image/jpeg' : 
                  m.mediaType === 'video' ? 'video/mp4' : 'application/octet-stream'
          })) || []
        }))
        
        setPosts(transformedPosts)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [manager?._id])

  // Helper functions
  const fetchClientNames = async (clientIds: string[]): Promise<{id: string, name: string}[]> => {
    try {
      if (!clientIds?.length) return []
      
      const response = await fetch(API_ROUTES.CLIENTS.GET_BY_IDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: clientIds }),
        credentials: 'include'
      })

      const responseText = await response.text()
      if (responseText.startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML response:', responseText.substring(0, 500))
        throw new Error('Server returned HTML instead of JSON')
      }

      const data = JSON.parse(responseText)
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }
      
      return data.data.map((client: any) => ({ 
        id: client._id, 
        name: client.name 
      }))
    } catch (error) {
      console.error('Fetch error:', error)
      return clientIds.map(id => ({ id, name: id }))
    }
  }

  const resetModal = () => {
    setCurrentStep(1)
    setFormData({
      title: "",
      platforms: [],
      clients: [],
      content: "",
      tags: [],
      links: [],
      attachments: [],
      existingMedia: [],
      aiEnabled: false,
      aiInstructions: "",
      dueDate: "",
      time: "",
      status: "Draft",
    })
    setValidationErrors({})
    setCurrentTag("")
    setCurrentLink({ text: "", url: "" })
    setEditingPost(null)
  }

  const handleEditPost = (post: CalendarContentItem) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      platforms: [post.type],
      clients: [post.clientId],
      content: post.content || "",
      tags: post.tags || [],
      links: [],
      attachments: [],
      existingMedia: post.media || [],
      aiEnabled: false,
      aiInstructions: "",
      dueDate: post.date,
      time: post.time,
      status: post.status,
    })
    setShowCreateModal(true)
  }

  const handleSavePost = async () => {
    if (!manager?._id) return

    try {
      setLoading(true)
      
      // Validate date and time inputs
      if (!formData.dueDate) {
        throw new Error("Date is required")
      }

      // Default to current time if time not provided
      const timeValue = formData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      // Parse the time string into hours and minutes
      const [hours, minutes] = timeValue.split(':').map(Number)
      
      // Create date object from dueDate
      const scheduledTime = new Date(formData.dueDate).toISOString();

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('platforms', JSON.stringify(
        formData.platforms.map(platform => ({
          platform: platform.toLowerCase(),
          status: "pending"
        }))
      ))
      formDataToSend.append('client', formData.clients[0])
      formDataToSend.append('content', formData.content)
      formDataToSend.append('status', formData.status.toLowerCase())
      formDataToSend.append('scheduledTime', scheduledTime)
      formDataToSend.append('Manager', manager._id)

      // Append tags
      formData.tags.forEach(tag => {
        formDataToSend.append('hashtags', tag)
      })

      // Append existing media
      if (formData.existingMedia.length > 0) {
        formDataToSend.append('existingMedia', JSON.stringify(
          formData.existingMedia.map(m => ({
            url: m.url,
            publicId: m.publicId,
            mediaType: m.type.startsWith('image') ? 'image' : 'video'
          }))
        ))
      }

      // Append new files
      formData.attachments.forEach(file => {
        formDataToSend.append('attachments', file)
      })

      const url = editingPost ? API_ROUTES.POSTS.UPDATE(editingPost.id) : API_ROUTES.POSTS.CREATE
      const method = editingPost ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save post")
      }
      
      const responseData = await response.json()
      
      // Transform the updated/new post for our calendar
      const transformPost = (post: any) => ({
        id: post._id,
        title: post.title,
        client: post.client?.name || 'Unknown Client',
        clientId: post.client?._id || '',
        time: new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: post.status.charAt(0).toUpperCase() + post.status.slice(1),
        type: post.platforms?.[0]?.platform || 'Social Media',
        date: new Date(post.scheduledTime).toISOString().split('T')[0],
        content: post.content,
        tags: post.hashtags || [],
        media: post.media?.map((m: any) => ({
          url: m.url,
          publicId: m.publicId,
          name: m.caption || 'media',
          type: m.mediaType === 'image' ? 'image/jpeg' : 
                m.mediaType === 'video' ? 'video/mp4' : 'application/octet-stream'
        })) || []
      })

      // Update posts list
      if (editingPost) {
        setPosts(posts.map(p => 
          p.id === editingPost.id ? transformPost(responseData.data) : p
        ))
      } else {
        setPosts([transformPost(responseData.data), ...posts])
      }
      
      setShowCreateModal(false)
      resetModal()
    } catch (error) {
      console.error('Error saving post:', error)
      setValidationErrors({ 
        general: error instanceof Error ? error.message : "Failed to save post" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAI = async () => {
    if (!formData.aiInstructions.trim()) {
      setValidationErrors((prev) => ({ ...prev, aiInstructions: "AI instructions are required" }))
      return
    }

    setIsGeneratingAI(true)

    try {
      const chatHistory = []
      const userPrompt = `Generate content for ${formData.platforms} titled "${formData.title}". 
        Please format your response with:
        - Content description first
        - Then a line with just "Tags:"
        - Then a comma-separated list of relevant hashtags
        Additional instructions: ${formData.aiInstructions}`

      chatHistory.push({ role: "user", parts: [{ text: userPrompt }] })

      const payload = { contents: chatHistory }
      const apiKey = "AIzaSyCIgNNIcKic4HKKl1vseBNpjKTO5dLM6Lw"
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const generatedText: string = result.candidates[0].content.parts[0].text
        const tagsIndex: number = generatedText.indexOf("Tags:")
        let content: string = generatedText
        let tags: string[] = []
        
        if (tagsIndex !== -1) {
          content = generatedText.substring(0, tagsIndex).trim()
          const tagsSection: string = generatedText.substring(tagsIndex + 5).trim()
          tags = tagsSection.split(',')
            .map((tag: string) => tag.trim().replace(/^#/, ''))
            .filter((tag: string) => tag.length > 0)
        }

        setFormData((prev) => ({ 
          ...prev, 
          content: content,
          tags: [...prev.tags, ...tags]
        }))
      } else {
        console.error("AI generation failed or returned unexpected structure.")
        setValidationErrors((prev) => ({ ...prev, ai: "AI generation failed. Please try again." }))
      }
    } catch (error) {
      console.error("AI generation error:", error)
      setValidationErrors((prev) => ({ ...prev, ai: "AI generation failed. Please try again." }))
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const validateCurrentStep = () => {
    const errors: ValidationErrors = {}

    if (currentStep === 1) {
      if (!formData.title.trim()) errors.title = "Title is required"
      if (formData.platforms.length === 0) errors.platforms = "At least one platform is required"
      if (formData.clients.length === 0) errors.clients = "At least one client is required"
    } else if (currentStep === 2) {
      if (!formData.content.trim()) errors.content = "Content is required"
    } else if (currentStep === 3) {
      if (!formData.dueDate) {
        errors.dueDate = "Scheduled time is required"
      } else {
        const selectedDate = new Date(formData.dueDate)
        const now = new Date()
        if (selectedDate < now) {
          errors.dueDate = "Cannot schedule for past date/time"
        }
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Filter and calendar rendering logic
  const filteredContent = useMemo(() => {
    let filtered = [...posts]

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchTermLower) ||
          item.client.toLowerCase().includes(searchTermLower)
      )
    }

    // Apply platform filter
    if (platformFilter.length > 0) {
      filtered = filtered.filter(item => 
        platformFilter.some(p => p.toLowerCase() === item.type.toLowerCase()))
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(item => 
        statusFilter.some(s => s.toLowerCase() === item.status.toLowerCase())
      )
    }

    // Apply client filter
    if (clientFilter.length > 0) {
      filtered = filtered.filter(item => 
        clientFilter.some(c => c.toLowerCase() === item.clientId.toLowerCase())
      )
    }

    return filtered
  }, [searchTerm, platformFilter, statusFilter, clientFilter, posts])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayContent = filteredContent.filter((item) => {
        const itemDate = new Date(item.date)
        return (
          itemDate.getDate() === date.getDate() &&
          itemDate.getMonth() === date.getMonth() &&
          itemDate.getFullYear() === date.getFullYear()
        )
      })

      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        content: dayContent,
      })
    }

    return days
  }, [currentDate, filteredContent])

  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "instagram": return "📷"
      case "newsletter": return "📧"
      case "blog": return "📝"
      case "email": return "✉️"
      case "linkedin": return "🔗"
      case "facebook": return "👍"
      case "twitter": return "🐦"
      case "tiktok": return "🎵"
      default: return "📄"
    }
  }

  const formatSelectedDate = () => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(direction === "prev" ? newDate.getMonth() - 1 : newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilter(prev => 
      prev.some(p => p.toLowerCase() === platform.toLowerCase())
        ? prev.filter(p => p.toLowerCase() !== platform.toLowerCase())
        : [...prev, platform]
    )
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.some(s => s.toLowerCase() === status.toLowerCase())
        ? prev.filter(s => s.toLowerCase() !== status.toLowerCase())
        : [...prev, status]
    )
  }

  const toggleClientFilter = (clientId: string) => {
    setClientFilter(prev => 
      prev.some(c => c === clientId)
        ? prev.filter(c => c !== clientId)
        : [...prev, clientId]
    )
  }

  const resetFilters = () => {
    setPlatformFilter([])
    setStatusFilter([])
    setClientFilter([])
  }

  const renderPreviewModal = () => (
    <div className={styles.modalOverlay} onClick={() => setPreviewContent(null)}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Content Preview</h2>
          <button 
            onClick={() => setPreviewContent(null)} 
            className={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div className={styles.previewContent}>
          {previewContent && (
            <>
              {/* Header Section */}
              <div className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewTitleSection}>
                    <span className={styles.contentTypeIcon}>
                      {getContentIcon(previewContent.type)}
                    </span>
                    <h3>{previewContent.title}</h3>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status${previewContent.status}`]}`}>
                    {previewContent.status}
                  </span>
                </div>

                <div className={styles.previewMeta}>
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Client:</span>
                      <span>{previewContent.client}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Platform:</span>
                      <span>{previewContent.type}</span>
                    </div>
                  </div>
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Scheduled:</span>
                      <span>
                        {new Date(previewContent.date).toLocaleDateString()} at {previewContent.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              {previewContent.content && (
                <div className={styles.previewSection}>
                  <h4 className={styles.sectionTitle}>Content</h4>
                  <div className={styles.previewTextContent}>
                    {previewContent.content}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {previewContent.tags && previewContent.tags.length > 0 && (
                <div className={styles.previewSection}>
                  <h4 className={styles.sectionTitle}>Tags</h4>
                  <div className={styles.previewTags}>
                    <div className={styles.tagsList}>
                      {previewContent.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Media Section */}
              {previewContent.media && previewContent.media.length > 0 && (
                <div className={styles.previewSection}>
                  <h4 className={styles.sectionTitle}>Media</h4>
                  <div className={styles.previewMedia}>
                    <div className={styles.mediaGrid}>
                      {previewContent.media.map((media, index) => (
                        <div key={index} className={styles.mediaItem}>
                          {media.type.startsWith('image') ? (
                            <img 
                              src={media.url} 
                              alt={media.name} 
                              className={styles.mediaPreview}
                            />
                          ) : (
                            <video controls className={styles.mediaPreview}>
                              <source src={media.url} type={media.type} />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <div className={styles.mediaInfo}>
                            <span className={styles.mediaName}>{media.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Modal Components
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.formLabel}>
          Content Title <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter a descriptive title"
          className={`${styles.formInput} ${validationErrors.title ? styles.inputError : ""}`}
        />
        {validationErrors.title && <span className={styles.errorMessage}>{validationErrors.title}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Platforms <span className={styles.required}>*</span>
        </label>
        <div className={styles.platformSelection}>
          {platformOptions.map((platform) => (
            <button
              key={platform}
              type="button"
              className={`${styles.platformButton} ${
                formData.platforms.includes(platform) ? styles.selected : ""
              }`}
              onClick={() => {
                const updatedPlatforms = formData.platforms.includes(platform)
                  ? formData.platforms.filter(p => p !== platform)
                  : [...formData.platforms, platform]
                setFormData({...formData, platforms: updatedPlatforms})
              }}
            >
              {platform}
            </button>
          ))}
        </div>
        {validationErrors.platforms && (
          <span className={styles.errorMessage}>{validationErrors.platforms}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="clients" className={styles.formLabel}>
          Clients <span className={styles.required}>*</span>
        </label>
        <select
          id="clients"
          multiple
          value={formData.clients}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, option => option.value)
            setFormData({...formData, clients: options})
          }}
          className={`${styles.formSelect} ${validationErrors.clients ? styles.inputError : ""}`}
          required
        >
          {clientsData.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {validationErrors.clients && <span className={styles.errorMessage}>{validationErrors.clients}</span>}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.aiSection}>
        <h3 className={styles.aiTitle}>Generate with AI</h3>
        <div className={styles.aiToggle}>
          <input
            type="checkbox"
            id="aiEnabled"
            checked={formData.aiEnabled}
            onChange={(e) => setFormData({...formData, aiEnabled: e.target.checked})}
            className={styles.checkbox}
          />
          <label htmlFor="aiEnabled" className={styles.checkboxLabel}>
            Enable AI content generation
          </label>
        </div>

        {formData.aiEnabled && (
          <div className={styles.aiControls}>
            <div className={styles.formGroup}>
              <label htmlFor="aiInstructions" className={styles.formLabel}>
                AI Prompt/Instructions
              </label>
              <input
                type="text"
                id="aiInstructions"
                value={formData.aiInstructions}
                onChange={(e) => setFormData({...formData, aiInstructions: e.target.value})}
                placeholder="e.g., Write a catchy social media post about our new product launch"
                className={`${styles.formInput} ${validationErrors.aiInstructions ? styles.inputError : ""}`}
              />
              {validationErrors.aiInstructions && (
                <span className={styles.errorMessage}>{validationErrors.aiInstructions}</span>
              )}
            </div>

            <button 
              type="button" 
              onClick={handleGenerateAI} 
              disabled={isGeneratingAI} 
              className={styles.aiButton}
            >
              {isGeneratingAI ? "Generating..." : "Generate Content with AI"}
            </button>

            {validationErrors.ai && <span className={styles.errorMessage}>{validationErrors.ai}</span>}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content" className={styles.formLabel}>
          Content <span className={styles.required}>*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Write your post here..."
          rows={6}
          className={`${styles.formTextarea} ${validationErrors.content ? styles.inputError : ""}`}
        />
        <span className={styles.characterLimit}>Recommended 2200 characters max</span>
        {validationErrors.content && <span className={styles.errorMessage}>{validationErrors.content}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tags</label>
        <div className={styles.tagInput}>
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            placeholder="Add a tag"
            className={styles.formInput}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), 
              setFormData({...formData, tags: [...formData.tags, currentTag.trim()]}),
              setCurrentTag("")
            )}
          />
          <button 
            type="button" 
            onClick={() => {
              if (currentTag.trim()) {
                setFormData({...formData, tags: [...formData.tags, currentTag.trim()]})
                setCurrentTag("")
              }
            }} 
            className={styles.addButton}
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className={styles.tagsList}>
            {formData.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button 
                  type="button" 
                  onClick={() => {
                    const updatedTags = [...formData.tags]
                    updatedTags.splice(index, 1)
                    setFormData({...formData, tags: updatedTags})
                  }} 
                  className={styles.tagRemove}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Attachments</label>
        <div className={styles.fileUploadContainer}>
          <div className={styles.fileUploadBox}>
            <svg className={styles.uploadIcon} viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFormData({
                    ...formData,
                    attachments: [...formData.attachments, ...Array.from(e.target.files)]
                  })
                }
              }}
              className={styles.fileInput}
            />
            <label htmlFor="file-upload" className={styles.fileUploadLabel}>
              <div className={styles.uploadText}>
                <p className={styles.uploadTitle}>Drag and drop files here</p>
                <p className={styles.uploadSubtitle}>or click to browse</p>
              </div>
            </label>
          </div>
          
          {formData.existingMedia.length > 0 && (
            <div className={styles.attachmentsList}>
              <h4>Existing Media</h4>
              {formData.existingMedia.map((file, index) => (
                <div key={`existing-${index}`} className={styles.attachmentItem}>
                  <div className={styles.fileIcon}>
                    {file.type.startsWith('image/') ? '🖼️' : '🎬'}
                  </div>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileUrl}>{file.url.substring(0, 30)}...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedExisting = [...formData.existingMedia]
                      updatedExisting.splice(index, 1)
                      setFormData({...formData, existingMedia: updatedExisting})
                    }}
                    className={styles.attachmentRemove}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {formData.attachments.length > 0 && (
            <div className={styles.attachmentsList}>
              <h4>New Uploads</h4>
              {formData.attachments.map((file, index) => (
                <div key={`new-${index}`} className={styles.attachmentItem}>
                  <div className={styles.fileIcon}>
                    {file.type.startsWith('image/') ? '🖼️' : '🎬'}
                  </div>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedAttachments = [...formData.attachments]
                      updatedAttachments.splice(index, 1)
                      setFormData({...formData, attachments: updatedAttachments})
                    }}
                    className={styles.attachmentRemove}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const now = new Date()
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)

    return (
      <div className={styles.stepContent}>
        <div className={styles.formGroup}>
          <label htmlFor="scheduledTime" className={styles.formLabel}>
            Scheduled Time <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWithIcon}>
<input
  type="datetime-local"
  id="scheduledTime"
  value={formData.dueDate ? `${formData.dueDate}T${formData.time || '12:00'}` : ''}
  onChange={(e) => {
    const [date, time] = e.target.value.split('T')
    setFormData({
      ...formData,
      dueDate: date,
      time: time || '12:00'
    })
  }}
  min={localISOTime}
  className={`${styles.formInput} ${validationErrors.dueDate ? styles.inputError : ""}`}
/>
            <span className={styles.inputIcon}>📅</span>
          </div>
          {validationErrors.dueDate && (
            <span className={styles.errorMessage}>{validationErrors.dueDate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="status" className={styles.formLabel}>
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className={styles.formSelect}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.contentSummary}>
          <h3 className={styles.summaryTitle}>Content Summary</h3>
          <div className={styles.summaryContent}>
            <p>
              <strong>Title:</strong> {formData.title}
            </p>
            <p>
              <strong>Platforms:</strong> {formData.platforms.join(", ")}
            </p>
            <p>
              <strong>Content:</strong> {formData.content.substring(0, 100)}
              {formData.content.length > 100 ? "..." : ""}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingPost ? "Edit Content" : "Create New Content"}
          </h2>
          <button onClick={() => setShowCreateModal(false)} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.stepIndicator}>
          {[1, 2, 3].map((step) => (
            <div key={step} className={`${styles.stepCircle} ${currentStep >= step ? styles.stepActive : ""}`}>
              {step}
            </div>
          ))}
        </div>

        <div className={styles.modalBody}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className={styles.modalFooter}>
          {currentStep > 1 && (
            <button onClick={() => setCurrentStep(currentStep - 1)} className={styles.previousButton}>
              ← Previous
            </button>
          )}

          <div className={styles.footerRight}>
            {currentStep < 3 ? (
              <button 
                onClick={() => validateCurrentStep() && setCurrentStep(currentStep + 1)} 
                className={styles.nextButton}
              >
                Next →
              </button>
            ) : (
              <button onClick={handleSavePost} className={styles.saveButton}>
                {editingPost ? "Update Content" : "Save Content"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading calendar data...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="animation">
    <div className={styles.layout}>
      <main className={styles.main}>
        {/* Calendar Header and Navigation */}
        <div className={styles.header}>
          <h1 className={styles.title}>Content Calendar</h1>
          <div className={styles.actionsRow}>
            <div className={styles.leftActions}>
               <button 
                      className={styles.addContentButton}
                      onClick={() => {
                        const selectedDateObj = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          selectedDate
                        )
                        setFormData({
                          ...formData,
                          dueDate: selectedDateObj.toISOString().split('T')[0]
                        })
                        setShowCreateModal(true)
                      }}
                    >
                      <span className={styles.plusIcon}>+</span>
                      Add Content
                    </button>
              <div className={styles.filterWrapper} ref={filterRef}>
                <button 
                  className={styles.actionButton} 
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ padding:'1rem'}}
                >
                  <span className={styles.actionIcon}>⚙</span>
                  Filter
                  <span className={`${styles.chevron} ${showFilters ? styles.chevronUp : ''}`}>▼</span>
                </button>
                {/* Filter dropdown - positioned relative to the filter button */}
                {showFilters && (
                  <div className={styles.filterDropdown}>
                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}>Platforms</label>
                      <div className={styles.platformSelection}>
                        {platformOptions.map(platform => (
                          <button
                            key={platform}
                            type="button"
                            className={`${styles.platformButton} ${
                              platformFilter.includes(platform) ? styles.selected : ""
                            }`}
                            onClick={() => togglePlatformFilter(platform)}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}>Status</label>
                      <div className={styles.platformSelection}>
                        {statusOptions.map(status => (
                          <button
                            key={status}
                            type="button"
                            className={`${styles.platformButton} ${
                              statusFilter.includes(status) ? styles.selected : ""
                            }`}
                            onClick={() => toggleStatusFilter(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}>Clients</label>
                      <div className={styles.platformSelection}>
                        {clientsData.map(client => (
                          <button
                            key={client.id}
                            type="button"
                            className={`${styles.platformButton} ${
                              clientFilter.includes(client.id) ? styles.selected : ""
                            }`}
                            onClick={() => toggleClientFilter(client.id)}
                          >
                            {client.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <SearchBar 
              placeholder="Search content..." 
              onSearch={setSearchTerm}
              className={styles.searchContainer}
            />
          </div>
          <div className={styles.headerDivider} />
          <div className={styles.monthNavigation}>
            <button className={styles.navButton} onClick={() => navigateMonth("prev")}>
              ←
            </button>
            <span className={styles.monthYear}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button className={styles.navButton} onClick={() => navigateMonth("next")}>
              →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={styles.contentArea}>
          <div className={styles.calendarSection}>
            <div className={styles.calendarGrid}>
              <div className={styles.dayHeaders}>
                {dayNames.map((day) => (
                  <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
              </div>
              <div className={styles.daysGrid}>
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`${styles.dayCell} ${
                      !day.isCurrentMonth ? styles.otherMonth : ""
                    } ${
                      day.isToday ? styles.today : ""
                    } ${
                      selectedDate === day.date && day.isCurrentMonth ? styles.selected : ""
                    }`}
                    onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                  >
                    <div className={styles.dayNumber}>
                      {day.date}
                      <button 
                        className={styles.addDayContent}
                        onClick={(e) => {
                          e.stopPropagation()
                          const selectedDateObj = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            day.date
                          )
                          // Format as YYYY-MM-DD
                          const formattedDate = selectedDateObj.toISOString().split('T')[0]
                          setFormData(prev => ({
                            ...prev,
                            dueDate: formattedDate,
                            // Also set the time to a default if needed
                            time: prev.time || "12:00"
                          }))
                          setShowCreateModal(true)
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.dayContent}>
                      {day.content.slice(0, 2).map((item) => (
                        <div key={item.id} className={`${styles.contentItem} ${styles[`status${item.status}`]}`}>
                          <span className={styles.contentIcon}>{getContentIcon(item.type)}</span>
                          <span className={styles.contentTitle}>
                            {item.title.length > 12 ? `${item.title.substring(0, 12)}...` : item.title}
                          </span>
                        </div>
                      ))}
                      {day.content.length > 2 && (
                        <div className={styles.moreItems}>+{day.content.length - 2} more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Detail Section */}
          <div className={styles.dailyDetailSection}>
            <div className={styles.dailyDetailContainer}>
              <h3 className={styles.selectedDate}>{formatSelectedDate()}</h3>
              <div className={styles.dailyContent}>
                {filteredContent.filter(item => {
                  const itemDate = new Date(item.date)
                  return (
                    itemDate.getDate() === selectedDate &&
                    itemDate.getMonth() === currentDate.getMonth() &&
                    itemDate.getFullYear() === currentDate.getFullYear()
                  )
                }).length === 0 ? (
                  <div className={styles.noContent}>
                    <div className={styles.noContentIcon}>📅</div>
                    <h4 className={styles.noContentTitle}>No content scheduled</h4>
                    <p className={styles.noContentText}>Add some content to get started with your calendar.</p>
                    <button 
                      className={styles.addContentButton}
                      onClick={() => {
                        const selectedDateObj = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          selectedDate
                        )
                        setFormData({
                          ...formData,
                          dueDate: selectedDateObj.toISOString().split('T')[0]
                        })
                        setShowCreateModal(true)
                      }}
                    >
                      <span className={styles.plusIcon}>+</span>
                      Add Content
                    </button>
                  </div>
                ) : (
                  filteredContent
                    .filter(item => {
                      const itemDate = new Date(item.date)
                      return (
                        itemDate.getDate() === selectedDate &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear()
                      )
                    })
                    .map((item) => (
                      <div key={item.id} className={styles.contentDetail}>
                        <div className={styles.contentHeader}>
                          <div className={styles.contentTitleSection}>
                            <span className={styles.contentTypeIcon}>{getContentIcon(item.type)}</span>
                            <h4 className={styles.contentDetailTitle}>{item.title}</h4>
                          </div>
                          <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className={styles.contentMeta}>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Client:</span>
                            <span className={styles.metaValue}>{item.client}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Time:</span>
                            <span className={styles.metaValue}>{item.time}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Type:</span>
                            <span className={styles.metaValue}>{item.type}</span>
                          </div>
                        </div>
                        <div className={styles.contentActions}>
                          <button 
                            className={styles.editButton}
                            onClick={() => handleEditPost(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.previewButton}
                            onClick={() => setPreviewContent(item)}
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Content Modal */}
        {showCreateModal && renderModal() }
        {previewContent && renderPreviewModal()}
      </main>
    </div>
    </div>
  )
}