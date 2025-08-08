"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import ReusableTable, { type TableColumn, type TableAction } from "../../../components/table"
import type { ContentItem, FilterTab } from "../../../components/content"
import type { CreateContentFormData, ValidationErrors } from "../../../components/create-content"
import styles from "@/styling/content.module.css"
import SearchBar from "../../../components/searchbar"
import API_ROUTES from "@/app/apiRoutes"
import { useManager } from "@/contexts/managerContext"
import { IconEdit, IconTrash, IconUpload, IconCheck, IconLoader2 } from "@tabler/icons-react"

interface Platform {
  platform: string
  account: string
  postId?: string
  status?: string
  publishedAt?: string
  url?: string
  analytics?: {
    likes?: number
    comments?: number
    shares?: number
    reach?: number
    impressions?: number
    engagementRate?: number
  }
}

interface Media {
  url: string
  publicId: string
  mediaType: string
  caption?: string
}

interface PostItem {
  _id: string
  title: string
  content: string
  media: Media[]
  hashtags: string[]
  scheduledTime: string
  status: string
  platforms: Platform[]
  isSimulated: boolean
  client: string | { _id: string; name: string }
  Manager: string
  createdAt: string
  updatedAt: string
}

const filterTabs: FilterTab[] = ["all", "draft", "scheduled", "published", "failed"]

function CreateContentModal({
  currentStep,
  formData,
  validationErrors,
  isGeneratingAI,
  currentTag,
  currentLink,
  managerClients,
  onClose,
  onNext,
  onPrevious,
  onSave,
  onFormDataChange,
  onTagChange,
  onLinkChange,
  onAddTag,
  onRemoveTag,
  onAddLink,
  onRemoveLink,
  onGenerateAI,
  onFileUpload,
}: {
  currentStep: number
  formData: CreateContentFormData
  validationErrors: ValidationErrors
  isGeneratingAI: boolean
  currentTag: string
  currentLink: { text: string; url: string }
  managerClients: {id: string, name: string}[]
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onSave: () => void
  onFormDataChange: (updates: Partial<CreateContentFormData>) => void
  onTagChange: (tag: string) => void
  onLinkChange: (link: { text: string; url: string }) => void
  onAddTag: () => void
  onRemoveTag: (index: number) => void
  onAddLink: () => void
  onRemoveLink: (index: number) => void
  onGenerateAI: () => void
  onFileUpload: (files: File[]) => void
}) {
  const platformOptions = ["Instagram", "Facebook", "LinkedIn"]
  const statuses = ["Draft", "Scheduled", "Published", "Failed"]

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value)
    onFormDataChange({ clients: options })
  }

  const togglePlatform = (platform: string) => {
    const updatedPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform]
    onFormDataChange({ platforms: updatedPlatforms })
  }

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
          onChange={(e) => onFormDataChange({ title: e.target.value })}
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
              onClick={() => togglePlatform(platform)}
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
          onChange={handleClientChange}
          className={`${styles.formSelect} ${validationErrors.clients ? styles.inputError : ""}`}
          required
        >
          {managerClients.map((client) => (
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
      {/* AI Generation Section */}
      <div className={styles.aiSection}>
        <h3 className={styles.aiTitle}>Generate with AI</h3>
        <div className={styles.aiToggle}>
          <input
            type="checkbox"
            id="aiEnabled"
            checked={formData.aiEnabled}
            onChange={(e) => onFormDataChange({ aiEnabled: e.target.checked })}
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
                onChange={(e) => onFormDataChange({ aiInstructions: e.target.value })}
                placeholder="e.g., Write a catchy social media post about our new product launch"
                className={`${styles.formInput} ${validationErrors.aiInstructions ? styles.inputError : ""}`}
              />
              {validationErrors.aiInstructions && (
                <span className={styles.errorMessage}>{validationErrors.aiInstructions}</span>
              )}
            </div>

            <button type="button" onClick={onGenerateAI} disabled={isGeneratingAI} className={styles.aiButton}>
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
          onChange={(e) => onFormDataChange({ content: e.target.value })}
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
            onChange={(e) => onTagChange(e.target.value)}
            placeholder="Add a tag"
            className={styles.formInput}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), onAddTag())}
          />
          <button type="button" onClick={onAddTag} className={styles.addButton}>
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className={styles.tagsList}>
            {formData.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button type="button" onClick={() => onRemoveTag(index)} className={styles.tagRemove}>
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
                  onFileUpload(Array.from(e.target.files))
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
          
          {/* Existing Media */}
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
                      const updatedExisting = [...formData.existingMedia];
                      updatedExisting.splice(index, 1);
                      onFormDataChange({ existingMedia: updatedExisting });
                    }}
                    className={styles.attachmentRemove}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* New Media */}
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
                      const updatedAttachments = [...formData.attachments];
                      updatedAttachments.splice(index, 1);
                      onFormDataChange({ attachments: updatedAttachments });
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
  );

  const renderStep3 = () => {
    // Get current date/time in the correct format for datetime-local input
    const now = new Date();
    // Adjust for timezone offset and convert to ISO string without milliseconds
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

      
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
              value={formData.dueDate}
              onChange={(e) => onFormDataChange({ dueDate: e.target.value })}
              min={localISOTime} // This prevents selecting past dates/times
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
            onChange={(e) => onFormDataChange({ status: e.target.value })}
            className={styles.formSelect}
          >
            {statuses.map((status) => (
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

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Content</h2>
          <button onClick={onClose} className={styles.closeButton}>
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
            <button onClick={onPrevious} className={styles.previousButton}>
              ← Previous
            </button>
          )}

          <div className={styles.footerRight}>
            {currentStep < 3 ? (
              <button onClick={onNext} className={styles.nextButton}>
                Next →
              </button>
            ) : (
              <button onClick={onSave} className={styles.saveButton}>
                Save Content
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContentPage() {
  const { manager, loading: managerLoading } = useManager()
  const router = useRouter()
  const [clientsData, setClientsData] = useState<{id: string, name: string}[]>([]);
  const [clientsError, setClientsError] = useState('');
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [showFilters, setShowFilters] = useState(false)
  
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
  const [platformFilter, setPlatformFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [uploadingPosts, setUploadingPosts] = useState<Set<string>>(new Set())
  const [uploadLogs, setUploadLogs] = useState<{[postId: string]: any[]}>({})

  // Add these constants for filter options
  const platformOptions = ["Instagram", "Facebook", "LinkedIn"]
  const statusOptions = ["Draft", "Scheduled", "Published", "Failed"]

  const handleUploadPost = async (postId: string) => {
    setUploadingPosts(prev => new Set([...prev, postId]))
    
    try {
      // Find the post to get its client and platforms
      const post = posts.find(p => p._id === postId)
      if (!post) {
        throw new Error('Post not found')
      }

      // Get the client's social accounts
      const clientId = typeof post.client === 'string' ? post.client : post.client._id;
      const socialAccountsResponse = await fetch(`http://localhost:3000/api/v1/social-accounts/client/${clientId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!socialAccountsResponse.ok) {
        throw new Error('Failed to fetch social accounts')
      }

      const socialAccountsData = await socialAccountsResponse.json()
      const socialAccounts = socialAccountsData.data || []

      // Find matching accounts for all platforms in the post
      interface UploadResult {
        platform: string;
        result: any;
        account: any;
      }
      
      const uploadResults: UploadResult[] = []
      const errors: string[] = []
      
      for (const postPlatform of post.platforms) {
        try {
          const matchingAccount = socialAccounts.find((account: any) => 
            account.platform.toLowerCase() === postPlatform.platform.toLowerCase()
          )
          
          if (!matchingAccount) {
            errors.push(`No social account found for platform: ${postPlatform.platform}`)
            continue
          }

          // Determine the upload endpoint based on platform
          let uploadEndpoint = ''
          switch (postPlatform.platform.toLowerCase()) {
            case 'linkedin':
              uploadEndpoint = `http://localhost:3000/api/v1/upload/linkedin/${postId}`
              break
            case 'facebook':
              uploadEndpoint = `http://localhost:3000/api/v1/upload/facebook/${postId}`
              break
            case 'instagram':
              uploadEndpoint = `http://localhost:3000/api/v1/upload/instagram/${postId}`
              break
            default:
              errors.push(`Unsupported platform: ${postPlatform.platform}`)
              continue
          }

          // Upload to this platform
          const uploadResponse = await fetch(uploadEndpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              accountId: matchingAccount._id
            })
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            errors.push(`${postPlatform.platform}: ${errorData.message || 'Upload failed'}`)
            continue
          }

          const uploadResult = await uploadResponse.json()
          uploadResults.push({
            platform: postPlatform.platform,
            result: uploadResult,
            account: matchingAccount
          })

        } catch (platformError) {
          errors.push(`${postPlatform.platform}: ${platformError instanceof Error ? platformError.message : 'Unknown error'}`)
        }
      }

      // Check if at least one upload was successful
      if (uploadResults.length === 0) {
        throw new Error(`All uploads failed: ${errors.join(', ')}`)
      }

      // Update post status in database after successful upload(s)
      const updateStatusResponse = await fetch(API_ROUTES.POSTS.UPDATE(postId), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'published',
          publishedAt: new Date().toISOString(),
          // Update platform statuses
          platforms: post.platforms.map(platform => ({
            ...platform,
            status: uploadResults.some(result => 
              result.platform.toLowerCase() === platform.platform.toLowerCase()
            ) ? 'published' : 'failed'
          }))
        })
      })

      if (!updateStatusResponse.ok) {
        console.warn('Failed to update post status in database, but upload(s) were successful')
      }

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                status: 'published',
                publishedAt: new Date().toISOString(),
                platforms: p.platforms.map(platform => ({
                  ...platform,
                  status: uploadResults.some(result => 
                    result.platform.toLowerCase() === platform.platform.toLowerCase()
                  ) ? 'published' : 'failed'
                }))
              }
            : p
        )
      )

      // Store upload logs
      setUploadLogs(prev => ({
        ...prev,
        [postId]: uploadResults
      }))

      // Show summary message
      const successCount = uploadResults.length
      const totalCount = post.platforms.length
      let message = `Successfully uploaded to ${successCount}/${totalCount} platforms`
      
      if (errors.length > 0) {
        message += `. Errors: ${errors.join(', ')}`
      }
      
      console.log(message)
      
      if (errors.length > 0 && successCount > 0) {
        setError(`Partial success: ${message}`)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(`Failed to upload post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  const combineContentWithHashtags = (content: string, hashtags: string[]): string => {
    // Clean content (remove any existing hashtags at the end)
    let cleanContent = content.trim()
    
    // Add hashtags at the end if they exist
    if (hashtags && hashtags.length > 0) {
      const hashtagsString = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ')
      
      cleanContent = `${cleanContent}\n\n${hashtagsString}`
    }
    
    return cleanContent
  }

  async function fetchClientNames(clientIds: string[]): Promise<{id: string, name: string}[]> {
    try {
      if (!clientIds?.length) return [];
      
      const response = await fetch(API_ROUTES.CLIENTS.GET_BY_IDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ids: clientIds }),
        credentials: 'include'
      });

      // First check if response is HTML
      const responseText = await response.text();
      if (responseText.startsWith('<!DOCTYPE html>')) {
        console.error('Received HTML response:', responseText.substring(0, 500));
        throw new Error('Server returned HTML instead of JSON');
      }

      // Try to parse as JSON
      const data = JSON.parse(responseText);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data.data.map((client: any) => ({ 
        id: client._id, 
        name: client.name 
      }));
    } catch (error) {
      console.error('Fetch error:', error);
      return clientIds.map(id => ({ id, name: id })); // Fallback
    }
  }

  useEffect(() => {
    if (manager?.managedClients?.length) {
      // Fetch client names - you'll need to implement this API endpoint
      fetchClientNames(manager.managedClients).then(data => {
        setClientsData(data);
      });
    }
  }, [manager?.managedClients]);

  useEffect(() => {
    const fetchManagerPosts = async () => {
      if (!manager?._id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const url = API_ROUTES.POSTS.BY_MANAGER(manager._id)
        const response = await fetch(url, {
          credentials: "include",
          headers: {
            'Accept': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        setPosts(data.data || [])
        setError("")
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load posts")
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchManagerPosts()
  }, [manager?._id])

  const contentColumns: TableColumn[] = [
    {
      key: "title",
      label: "TITLE",
      type: "string",
      sortable: true,
    },
    {
      key: "content",
      label: "CONTENT",
      type: "string",
      sortable: false,
      render: (value) => (
        <div className={styles.contentPreview}>
          {value.length > 100 ? `${value.substring(0, 100)}...` : value}
        </div>
      )
    },
    {
      key: "platforms",
      label: "PLATFORMS",
      type: "array",
      sortable: false,
      render: (_, row) => (
        <div className={styles.platformTags}>
          {row.platforms.map((platform: Platform, index: number) => (
            <span key={index} className={styles.platformTag}>
              {platform.platform}
            </span>
          ))}
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      type: "status",
      sortable: true,
    },
    {
      key: "scheduledTime",
      label: "SCHEDULED",
      type: "date",
      sortable: true,
    },
    {
  key: "actions",
  label: "ACTIONS",
  type: "actions",
  sortable: false,
  render: (_, row) => (
    <div className={styles.actionButtons}>
      <button 
        onClick={() => handleEditPost(row)}
        className={styles.editButton}
        title="Edit post"
      >
        <IconEdit size={16} />
      </button>
      
      {/* Show upload button only if status is not published */}
      {row.status.toLowerCase() !== 'published' && (
        <button 
          onClick={() => handleUploadPost(row._id)}
          disabled={uploadingPosts.has(row._id)}
          className={styles.uploadButton}
          title={`Upload to: ${row.platforms.map((p: Platform) => p.platform).join(', ')}`}
        >
          {uploadingPosts.has(row._id) ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <IconUpload size={16} />
          )}
        </button>
      )}
      
      {/* Show published status indicator if published */}
      {row.status.toLowerCase() === 'published' && (
        <span className={styles.publishedIndicator} title="Already published">
          <IconCheck size={16} />
        </span>
      )}
      
      <button 
        onClick={() => handleDeletePost(row._id)}
        className={styles.deleteButton}
        title="Delete post"
      >
        <IconTrash size={16} />
      </button>
    </div>
  )
},
  ]

  const handleEditPost = async (post: PostItem) => {
    setEditingPost(post);

    const existingMedia = post.media.map(mediaItem => ({
      url: mediaItem.url,
      publicId: mediaItem.publicId,
      name: mediaItem.caption || 'media',
      type: mediaItem.mediaType === 'image' ? 'image/jpeg' : 
            mediaItem.mediaType === 'video' ? 'video/mp4' : 'application/octet-stream'
    }));
    
    const clientId = typeof post.client === 'string' ? post.client : post.client._id;
    
    setFormData({
      title: post.title,
      platforms: post.platforms.map((p: Platform) => p.platform),
      clients: [clientId], // Use the extracted client ID
      content: post.content,
      tags: [...post.hashtags],
      links: [], // Initialize empty array
      attachments: [], // Initialize empty array
      existingMedia,
      aiEnabled: false,
      aiInstructions: "",
      dueDate: post.scheduledTime,
      time: "", // You might want to extract time from scheduledTime
      status: post.status.charAt(0).toUpperCase() + post.status.slice(1),
    });
    setShowCreateModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(API_ROUTES.POSTS.DELETE(postId), {
          method: "DELETE",
          credentials: "include"
        })

        if (!response.ok) {
          throw new Error("Failed to delete post")
        }

        setPosts(posts.filter(post => post._id !== postId))
      } catch (err) {
        setError("Failed to delete post")
        console.error("Delete error:", err)
      }
    }
  }

  const handleUpdatePost = async () => {
    if (!editingPost?._id || !manager?._id) {
      console.error('Missing IDs - editingPost:', editingPost, 'manager:', manager);
      setError('Missing required IDs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Validation (same as before)
      const validationErrors: string[] = [];
      if (!formData.title.trim()) validationErrors.push('Title is required');
      if (formData.platforms.length === 0) validationErrors.push('At least one platform is required');
      if (formData.clients.length === 0) validationErrors.push('Please select at least one client');
      if (!formData.content.trim()) validationErrors.push('Content is required');
      if (!formData.dueDate) validationErrors.push('Scheduled time is required');
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const scheduledTime = new Date(formData.dueDate).toISOString();
      const clientId = formData.clients[0] || (typeof editingPost?.client === 'string' ? editingPost.client : editingPost?.client._id);
      
      // Combine content with hashtags
      const finalContent = combineContentWithHashtags(formData.content, formData.tags)

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', finalContent); // Use combined content
      formDataToSend.append('status', formData.status.toLowerCase());
      formDataToSend.append('scheduledTime', scheduledTime);
      formDataToSend.append('Manager', manager._id);
      formDataToSend.append('client', clientId);

      const platformsData = formData.platforms.map(platform => ({
        platform: platform.toLowerCase(),
        status: "pending"
      }));
      
      platformsData.forEach((platform, index) => {
        formDataToSend.append(`platforms[${index}][platform]`, platform.platform);
        formDataToSend.append(`platforms[${index}][status]`, platform.status);
      });

      formData.tags.forEach(tag => {
        formDataToSend.append('hashtags', tag);
      });

      if (formData.existingMedia.length > 0) {
        formDataToSend.append('existingMedia', JSON.stringify(formData.existingMedia));
      }

      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((file) => {
          formDataToSend.append(`attachments`, file);
        });
      }

      const response = await fetch(API_ROUTES.POSTS.UPDATE(editingPost._id), {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.message || errorData.error || 'Failed to update post');
      }

      const responseData = await response.json();

      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === editingPost._id ? responseData.data : post
        )
      );
      
      setShowCreateModal(false);
      setEditingPost(null);
      resetModal();
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  // Update your filteredPosts useMemo to this:
  const filteredPosts = useMemo(() => {
    let filtered = [...posts]
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(post => 
        post.status.toLowerCase() === activeTab.toLowerCase()
      )
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.content.toLowerCase().includes(term)
      )
    }
    
    // Apply platform filter - fixed comparison
    if (platformFilter.length > 0) {
      filtered = filtered.filter(post =>
        post.platforms.some(platform => 
          platformFilter.some(filterPlatform => 
            platform.platform.toLowerCase() === filterPlatform.toLowerCase()
          )
        )
      )
    }
    
    // Apply status filter - fixed case sensitivity
    if (statusFilter.length > 0) {
      filtered = filtered.filter(post =>
        statusFilter.some(filterStatus => 
          post.status.toLowerCase() === filterStatus.toLowerCase()
        )
      )
    }
    
    return filtered
  }, [posts, activeTab, searchTerm, platformFilter, statusFilter])

  const resetFilters = () => {
    setPlatformFilter([])
    setStatusFilter([])
    setActiveTab("all")
    setSearchTerm("")
  }

  // Add this function to handle platform filter toggling
  // Update your toggle functions to maintain consistent case
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
        const generatedText: string = result.candidates[0].content.parts[0].text;
        
        // Parse the response to separate content and tags
        const tagsIndex: number = generatedText.indexOf("Tags:");
        let content: string = generatedText;
        let tags: string[] = [];
        
        if (tagsIndex !== -1) {
          // Split into content and tags sections
          content = generatedText.substring(0, tagsIndex).trim();
          const tagsSection: string = generatedText.substring(tagsIndex + 5).trim();
          
          // Extract tags (comma-separated, remove # if present)
          tags = tagsSection.split(',')
            .map((tag: string) => tag.trim().replace(/^#/, ''))
            .filter((tag: string) => tag.length > 0);
        }

        setFormData((prev) => ({ 
          ...prev, 
          content: content,
          tags: [...prev.tags, ...tags] // Append new tags to existing ones
        }));
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

  const resetModal = () => {
    setCurrentStep(1);
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
    });
    setValidationErrors({});
    setCurrentTag("");
    setCurrentLink({ text: "", url: "" });
    setEditingPost(null); // Add this line
  };

  const handleSavePost = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setError('');

      const scheduledTime = new Date(formData.dueDate).toISOString();
      const clientId = formData.clients[0];
      
      // Combine content with hashtags
      const finalContent = combineContentWithHashtags(formData.content, formData.tags)
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('platforms', JSON.stringify(
        formData.platforms.map(platform => ({
          platform: platform.toLowerCase(),
          status: "pending"
        }))
      ));
      formDataToSend.append('client', clientId);
      formDataToSend.append('content', finalContent); // Use combined content
      formDataToSend.append('status', formData.status.toLowerCase());
      formDataToSend.append('scheduledTime', scheduledTime);
      
      if (manager?._id) {
        formDataToSend.append('Manager', manager._id);
      }

      // Still append tags separately for database storage
      formData.tags.forEach(tag => {
        formDataToSend.append('hashtags', tag);
      });

      if (formData.attachments.length > 0) {
        formData.attachments.forEach((file, index) => {
          formDataToSend.append(`attachments`, file);
        });
      }

      const response = await fetch(API_ROUTES.POSTS.CREATE, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save post");
      }
      
      const responseData = await response.json();
      setPosts(prevPosts => [responseData.data, ...prevPosts]);
      setShowCreateModal(false);
      resetModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  if (managerLoading) {
    return <div className={styles.loading}>Loading manager data...</div>
  }

  if (!manager || !manager.managedClients || manager.managedClients.length === 0) {
    return <div className={styles.error}>No manager data found. Please log in.</div>
  }

  return (
    <div className="animation">
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Content Management</h1>

          <div className={styles.topControls}>
            <div className={styles.actionButtons}>
              <button 
                className={styles.createButton} 
                onClick={() => setShowCreateModal(true)}
                disabled={!manager}
                style={{
                  backgroundColor: "var(--theme-tertiary)" 
                }}
              >
                <span className={styles.plusIcon}>+</span>
                Create Content
              </button>

              {/* Filter button with dropdown container */}
              <div className={styles.filterWrapper}>
                <button 
                  className={styles.actionButton} 
                  onClick={() => setShowFilters(!showFilters)}
                  disabled={!manager}
                >
                  <span className={styles.actionIcon}>⚙</span>
                  Filter
                  <span className={`${styles.chevronIcon} ${showFilters ? styles.chevronUp : ""}`}>▼</span>
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
                  </div>
                )}
              </div>
            </div>

            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!manager}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.tabs}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                disabled={!manager}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabContent}>
          {managerLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : !manager ? (
            <div className={styles.emptyState}>
              <p>Please log in to view content</p>
              <ReusableTable
                data={[]}
                columns={contentColumns}
                actions={[]}
                pageSize={5}
                searchable={false}
                emptyMessage="No content available"
              />
            </div>
          ) : loading ? (
            <div className={styles.loading}>Loading content...</div>
          ) : (
            <ReusableTable
              data={filteredPosts}
              columns={contentColumns}
              actions={[]}
              pageSize={5}
              searchable={false}
              emptyMessage="No content found"
              onRowClick={(row) => router.push(`/manager/content/${row._id}`)}
            />
          )}
        </div>
        
        {showCreateModal && (
          <CreateContentModal
            currentStep={currentStep}
            formData={formData}
            validationErrors={validationErrors}
            isGeneratingAI={isGeneratingAI}
            currentTag={currentTag}
            currentLink={currentLink}
            managerClients={clientsData}
            onClose={() => {
              setShowCreateModal(false);
              setEditingPost(null); // Ensure editingPost is reset
              resetModal();
            }}
            onNext={() => {
              if (validateCurrentStep()) {
                setCurrentStep((prev) => prev + 1)
              }
            }}
            onPrevious={() => setCurrentStep((prev) => prev - 1)}
            onSave={editingPost ? handleUpdatePost : handleSavePost}
            onFormDataChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
            onTagChange={setCurrentTag}
            onLinkChange={setCurrentLink}
            onAddTag={() => {
              if (currentTag.trim()) {
                setFormData((prev) => ({
                  ...prev,
                  tags: [...prev.tags, currentTag.trim()],
                }));
                setCurrentTag("");
              }
            }}
            onRemoveTag={(index) => {
              const updatedTags = [...formData.tags];
              updatedTags.splice(index, 1);
              setFormData((prev) => ({
                ...prev,
                tags: updatedTags,
              }));
            }}
            onAddLink={() => {
              if (currentLink.url.trim()) {
                setFormData((prev) => ({
                  ...prev,
                  links: [...prev.links, { ...currentLink }],
                }))
                setCurrentLink({ text: "", url: "" })
              }
            }}
            onRemoveLink={(index) => {
              setFormData((prev) => ({
                ...prev,
                links: prev.links.filter((_, i) => i !== index),
              }))
            }}
            onGenerateAI={handleGenerateAI}
            onFileUpload={(files) => {
              setFormData((prev) => ({
                ...prev,
                attachments: [...prev.attachments, ...files],
              }))
            }}
          />
        )}
      </main>
    </div>
    </div>
  )
}