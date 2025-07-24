"use client"

import type React from "react"

import { useState, useMemo } from "react"
import ReusableTable, { type TableColumn, type TableAction } from "../../../components/table"
import type { ContentItem, FilterTab } from "../../../components/content"
import type { CreateContentFormData, ValidationErrors } from "../../../components/create-content"
import styles from "@/styling/content.module.css"
import SearchBar from "../../../components/searchbar"

interface CreateContentModalProps {
  currentStep: number
  formData: CreateContentFormData
  validationErrors: ValidationErrors
  isGeneratingAI: boolean
  currentTag: string
  currentLink: { text: string; url: string }
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
}

function CreateContentModal({
  currentStep,
  formData,
  validationErrors,
  isGeneratingAI,
  currentTag,
  currentLink,
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
}: CreateContentModalProps) {
  const contentTypes = [
    "Social Media Post",
    "Blog Post",
    "Email Newsletter",
    "Press Release",
    "Website Content",
    "Advertisement",
  ]
  const platforms = ["Instagram", "Facebook", "LinkedIn", "Twitter", "TikTok"]
  const clients = ["ABC Corporation", "XYZ Company", "123 Industries", "Tech Solutions", "Global Marketing"]
  const teamMembers = ["Alex Morgan", "Jamie Wilson", "Taylor Reed"]
  const statuses = ["Draft", "Pending Approval", "Scheduled"]

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
        <label htmlFor="type" className={styles.formLabel}>
          Content Type <span className={styles.required}>*</span>
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => onFormDataChange({ type: e.target.value })}
          className={`${styles.formSelect} ${validationErrors.type ? styles.inputError : ""}`}
        >
          <option value="">Select Content Type</option>
          {contentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {validationErrors.type && <span className={styles.errorMessage}>{validationErrors.type}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="platform" className={styles.formLabel}>
          Platform <span className={styles.required}>*</span>
        </label>
        <select
          id="platform"
          value={formData.platform}
          onChange={(e) => onFormDataChange({ platform: e.target.value })}
          className={`${styles.formSelect} ${validationErrors.platform ? styles.inputError : ""}`}
        >
          <option value="">Select Platform</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
        {validationErrors.platform && <span className={styles.errorMessage}>{validationErrors.platform}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="client" className={styles.formLabel}>
          Client <span className={styles.required}>*</span>
        </label>
        <select
          id="client"
          value={formData.client}
          onChange={(e) => onFormDataChange({ client: e.target.value })}
          className={`${styles.formSelect} ${validationErrors.client ? styles.inputError : ""}`}
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
        {validationErrors.client && <span className={styles.errorMessage}>{validationErrors.client}</span>}
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
        <label className={styles.formLabel}>Links</label>
        <div className={styles.linkInput}>
          <input
            type="text"
            value={currentLink.text}
            onChange={(e) => onLinkChange({ ...currentLink, text: e.target.value })}
            placeholder="Link text (optional)"
            className={styles.formInput}
          />
          <input
            type="url"
            value={currentLink.url}
            onChange={(e) => onLinkChange({ ...currentLink, url: e.target.value })}
            placeholder="https://example.com"
            className={styles.formInput}
          />
          <button type="button" onClick={onAddLink} className={styles.addButton}>
            Add
          </button>
        </div>
        {formData.links.length > 0 && (
          <div className={styles.linksList}>
            {formData.links.map((link, index) => (
              <div key={index} className={styles.link}>
                <span>{link.text || link.url}</span>
                <button type="button" onClick={() => onRemoveLink(index)} className={styles.linkRemove}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Attachments</label>
        <div className={styles.fileUpload}>
          <div className={styles.fileDropZone}>
            <p>Drag and drop files here, or click to select files</p>
            <button type="button" className={styles.fileSelectButton}>
              Select Files
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label htmlFor="assignedTo" className={styles.formLabel}>
          Assigned To <span className={styles.required}>*</span>
        </label>
        <select
          id="assignedTo"
          value={formData.assignedTo}
          onChange={(e) => onFormDataChange({ assignedTo: e.target.value })}
          className={`${styles.formSelect} ${validationErrors.assignedTo ? styles.inputError : ""}`}
        >
          <option value="">Select Team Member</option>
          {teamMembers.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>
        {validationErrors.assignedTo && <span className={styles.errorMessage}>{validationErrors.assignedTo}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="dueDate" className={styles.formLabel}>
          Due Date <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWithIcon}>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => onFormDataChange({ dueDate: e.target.value })}
            className={`${styles.formInput} ${validationErrors.dueDate ? styles.inputError : ""}`}
          />
          <span className={styles.inputIcon}>📅</span>
        </div>
        {validationErrors.dueDate && <span className={styles.errorMessage}>{validationErrors.dueDate}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="time" className={styles.formLabel}>
          Time (optional)
        </label>
        <div className={styles.inputWithIcon}>
          <input
            type="time"
            id="time"
            value={formData.time}
            onChange={(e) => onFormDataChange({ time: e.target.value })}
            className={styles.formInput}
          />
          <span className={styles.inputIcon}>🕐</span>
        </div>
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
            <strong>Type:</strong> {formData.type} ({formData.platform})
          </p>
          <p>
            <strong>Client:</strong> {formData.client}
          </p>
          <p>
            <strong>Content:</strong> {formData.content.substring(0, 100)}
            {formData.content.length > 100 ? "..." : ""}
          </p>
        </div>
      </div>
    </div>
  )

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

const sampleData: ContentItem[] = [
  {
    id: "1",
    title: "Q3 Social Media Campaign for ABC Corp",
    type: "Social Media",
    client: "ABC Corporation",
    status: "Approved",
    dueDate: "Jul 15, 2023",
    assignedTo: "Taylor",
  },
  {
    id: "2",
    title: "Weekly Newsletter - Tech Updates",
    type: "Email",
    client: "XYZ Company",
    status: "Pending Approval",
    dueDate: "Jul 10, 2023",
    assignedTo: "Jamie V",
  },
  {
    id: "3",
    title: 'Blog Post: "10 Marketing Trends for 2023"',
    type: "Blog",
    client: "123 Industries",
    status: "Draft",
    dueDate: "Jul 20, 2023",
    assignedTo: "Alex M",
  },
  {
    id: "4",
    title: "Product Launch Press Release",
    type: "PR",
    client: "ABC Corporation",
    status: "Rejected",
    dueDate: "Jul 5, 2023",
    assignedTo: "Taylor",
  },
  {
    id: "5",
    title: "Instagram Story Series - Summer Collection",
    type: "Social Media",
    client: "XYZ Company",
    status: "Draft",
    dueDate: "Jul 25, 2023",
    assignedTo: "Jamie V",
  },
]

const filterTabs: FilterTab[] = ["All Content", "Drafts", "Pending Approval", "Approved", "Rejected"]

export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("All Content")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    contentType: "All Types",
    client: "All Clients",
    assignedTo: "All Team Members",
  })

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [formData, setFormData] = useState<CreateContentFormData>({
    title: "",
    type: "",
    platform: "",
    client: "",
    content: "",
    tags: [],
    links: [],
    attachments: [],
    aiEnabled: false,
    aiInstructions: "",
    assignedTo: "",
    dueDate: "",
    time: "",
    status: "Draft",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [currentTag, setCurrentTag] = useState("")
  const [currentLink, setCurrentLink] = useState({ text: "", url: "" })

  // Get all unique values for filter dropdowns
  const contentTypes = useMemo(() => {
    const types = new Set(sampleData.map((item) => item.type))
    return ["All Types", ...Array.from(types)]
  }, [])

  const clients = useMemo(() => {
    const clientList = new Set(sampleData.map((item) => item.client))
    return ["All Clients", ...Array.from(clientList)]
  }, [])

  const teamMembers = useMemo(() => {
    const members = new Set(sampleData.map((item) => item.assignedTo))
    return ["All Team Members", ...Array.from(members)]
  }, [])

  const filteredData = useMemo(() => {
    let filtered = [...sampleData]

    // First filter by tab if not "All Content"
    if (activeTab !== "All Content") {
      const statusMap: Record<string, ContentItem["status"]> = {
        Drafts: "Draft",
        "Pending Approval": "Pending Approval",
        Approved: "Approved",
        Rejected: "Rejected",
      }
      filtered = filtered.filter((item) => item.status === statusMap[activeTab])
    }

    // Then filter by search term if exists
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTermLower) || item.client.toLowerCase().includes(searchTermLower),
      )
    }

    // Then apply additional filters
    if (filters.contentType !== "All Types") {
      filtered = filtered.filter((item) => item.type === filters.contentType)
    }
    if (filters.client !== "All Clients") {
      filtered = filtered.filter((item) => item.client === filters.client)
    }
    if (filters.assignedTo !== "All Team Members") {
      filtered = filtered.filter((item) => item.assignedTo === filters.assignedTo)
    }

    return filtered
  }, [searchTerm, activeTab, filters])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({
      contentType: "All Types",
      client: "All Clients",
      assignedTo: "All Team Members",
    })
  }

  // Define columns for content table
  const contentColumns: TableColumn[] = [
    {
      key: "title",
      label: "TITLE",
      type: "string",
      sortable: true,
      render: (value) => <span className={styles.titleCell}>{value}</span>,
    },
    { key: "type", label: "TYPE", type: "string", sortable: true },
    { key: "client", label: "CLIENT", type: "string", sortable: true },
    { key: "status", label: "STATUS", type: "status", sortable: true },
    { key: "dueDate", label: "DUE DATE", type: "date", sortable: true },
    {
      key: "assignedTo",
      label: "ASSIGNED TO",
      type: "string",
      sortable: true,
      render: (value) => (
        <div className={styles.assignedUser}>
          <div className={styles.userAvatar}>{value.charAt(0)}</div>
          <span>{value}</span>
        </div>
      ),
    },
  ]

  // Define actions for content
  const contentActions: TableAction[] = [
    { label: "Edit", onClick: (row) => console.log("Edit", row) },
    { label: "View", onClick: (row) => console.log("View", row) },
    { label: "Delete", onClick: (row) => console.log("Delete", row), className: styles.deleteLink },
  ]

  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  // Modal functions
  const validateCurrentStep = () => {
    const errors: ValidationErrors = {}

    if (currentStep === 1) {
      if (!formData.title.trim()) errors.title = "Title is required"
      if (!formData.type) errors.type = "Content type is required"
      if (!formData.platform) errors.platform = "Platform is required"
      if (!formData.client) errors.client = "Client is required"
    } else if (currentStep === 2) {
      if (!formData.content.trim()) errors.content = "Content is required"
    } else if (currentStep === 3) {
      if (!formData.assignedTo) errors.assignedTo = "Assigned to is required"
      if (!formData.dueDate) errors.dueDate = "Due date is required"
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
      const userPrompt = `Generate a ${formData.type} for ${formData.platform} titled "${formData.title}". Additional instructions: ${formData.aiInstructions}`

      chatHistory.push({ role: "user", parts: [{ text: userPrompt }] })

      const payload = { contents: chatHistory }
      const apiKey = "" // Canvas will provide this
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
        const generatedText = result.candidates[0].content.parts[0].text
        setFormData((prev) => ({ ...prev, content: generatedText }))
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
    setCurrentStep(1)
    setFormData({
      title: "",
      type: "",
      platform: "",
      client: "",
      content: "",
      tags: [],
      links: [],
      attachments: [],
      aiEnabled: false,
      aiInstructions: "",
      assignedTo: "",
      dueDate: "",
      time: "",
      status: "Draft",
    })
    setValidationErrors({})
    setCurrentTag("")
    setCurrentLink({ text: "", url: "" })
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Content Management</h1>

          <div className={styles.topControls}>
            <div className={styles.actionButtons}>
              <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
                <span className={styles.plusIcon}>+</span>
                Create Content
              </button>

              <div className={styles.filterWrapper}>
                <button className={styles.actionButton} onClick={() => setShowFilters(!showFilters)}>
                  <span className={styles.actionIcon}>⚙</span>
                  Filter
                  <span className={`${styles.chevronIcon} ${showFilters ? styles.chevronUp : ""}`}>▼</span>
                </button>

                {showFilters && (
                  <div className={styles.filterDropdown}>
                    <div className={styles.filterGroup}>
                      <label htmlFor="contentType">Content Type</label>
                      <select
                        id="contentType"
                        name="contentType"
                        value={filters.contentType}
                        onChange={handleFilterChange}
                      >
                        {contentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.filterGroup}>
                      <label htmlFor="client">Client</label>
                      <select id="client" name="client" value={filters.client} onChange={handleFilterChange}>
                        {clients.map((client) => (
                          <option key={client} value={client}>
                            {client}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.filterGroup}>
                      <label htmlFor="assignedTo">Assigned To</label>
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={filters.assignedTo}
                        onChange={handleFilterChange}
                      >
                        {teamMembers.map((member) => (
                          <option key={member} value={member}>
                            {member}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.filterActions}>
                      <button className={styles.resetButton} onClick={resetFilters}>
                        Reset
                      </button>
                      <button className={styles.applyButton} onClick={() => setShowFilters(false)}>
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SearchBar placeholder="Search content..." onSearch={handleSearch} className={styles.searchContainer} />
          </div>

          <div className={styles.tabs}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabContent}>
          <ReusableTable
            data={filteredData}
            columns={contentColumns}
            actions={contentActions}
            pageSize={5}
            searchable={true}
            searchPlaceholder="Search content..."
            onRowClick={(row) => console.log("Row clicked:", row)}
          />
        </div>

        {showCreateModal && (
          <CreateContentModal
            currentStep={currentStep}
            formData={formData}
            validationErrors={validationErrors}
            isGeneratingAI={isGeneratingAI}
            currentTag={currentTag}
            currentLink={currentLink}
            onClose={() => {
              setShowCreateModal(false)
              resetModal()
            }}
            onNext={() => {
              if (validateCurrentStep()) {
                setCurrentStep((prev) => prev + 1)
              }
            }}
            onPrevious={() => setCurrentStep((prev) => prev - 1)}
            onSave={() => {
              if (validateCurrentStep()) {
                console.log("Saving content:", formData)
                setShowCreateModal(false)
                resetModal()
                // Here you would typically save to your backend
              }
            }}
            onFormDataChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
            onTagChange={setCurrentTag}
            onLinkChange={setCurrentLink}
            onAddTag={() => {
              if (currentTag.trim()) {
                setFormData((prev) => ({
                  ...prev,
                  tags: [...prev.tags, currentTag.trim()],
                }))
                setCurrentTag("")
              }
            }}
            onRemoveTag={(index) => {
              setFormData((prev) => ({
                ...prev,
                tags: prev.tags.filter((_, i) => i !== index),
              }))
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
          />
        )}
      </main>
    </div>
  )
}
