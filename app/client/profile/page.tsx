"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import API_ROUTES from '../../apiRoutes'
import { Edit2, Camera, X, Plus } from "lucide-react"
import styles from "../../../styling/clientProfile.module.css"


interface ContactPerson {
  name: string
  email: string
  phone: string
}

interface BillingInfo {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface Client {
  _id: string
  name: string
  description: string
  industry: string
  contactPerson: ContactPerson
  billingInfo: BillingInfo
  status: "active" | "inactive"
  tags: string[]
  profilePhoto: string
  createdAt: string
  user: string
  manager?: string
}

// Industry options from a comprehensive list
const INDUSTRY_OPTIONS = [
  "Influencer Marketing",
  "Filmmaker/Video Production",
  "Photography",
  "Fashion & Beauty",
  "Food & Beverage",
  "Travel & Tourism",
  "Technology",
  "Healthcare",
  "Education",
  "Real Estate",
  "Automotive",
  "Sports & Fitness",
  "Entertainment",
  "Music",
  "Art & Design",
  "E-commerce",
  "Finance",
  "Non-profit",
  "Gaming",
  "Lifestyle",
  "Business Services",
  "Construction",
  "Manufacturing",
  "Retail",
  "Hospitality",
]

export default function ClientProfile({ params }: { params: { id: string } }) {
  // User info state
  const [user, setUser] = useState<{ name: string; email: string; id: string }>({ name: '', email: '', id: '' })
  // Client state
  const [client, setClient] = useState<Client>({
    _id: params.id,
    name: "",
    description: "",
    industry: "",
    contactPerson: {
      name: "",
      email: "",
      phone: "",
    },
    billingInfo: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    status: "active",
    tags: [],
    profilePhoto: "",
    createdAt: new Date().toISOString(),
    user: "",
    manager: undefined,
  })

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserAndClient = async () => {
      try {
        // Fetch user info
        const res = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const userId = data.data?._id || ''
        setUser({
          name: data.data?.name || '',
          email: data.data?.email || '',
          id: userId,
        })

        // Fetch client for this user
        if (userId) {
          const clientRes = await fetch(`${API_ROUTES.CLIENTS.CREATE}?user=${userId}`, { credentials: 'include' })
          if (clientRes.ok) {
            const clientData = await clientRes.json()
            // If client exists, set it
            if (clientData.data && Array.isArray(clientData.data) && clientData.data.length > 0) {
              setClient((prev) => ({ ...prev, ...clientData.data[0] }))
            } else {
              // No client, prefill contact info
              setClient((prev) => ({
                ...prev,
                contactPerson: {
                  ...prev.contactPerson,
                  name: data.data?.name || '',
                  email: data.data?.email || '',
                },
                user: userId,
              }))
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    fetchUserAndClient()
  }, [])

  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<any>("")
  const [newTag, setNewTag] = useState("")
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSave = (field: string) => {
    if (field.includes(".")) {
      // Handle nested fields
      const [parent, child] = field.split(".")
      setClient((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Client] as any),
          [child]: tempValue,
        },
      }))
    } else {
      setClient((prev) => ({
        ...prev,
        [field]: tempValue,
      }))
    }
    setEditingField(null)
    setTempValue("")
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue("")
  }

  const handleStatusToggle = () => {
    setClient((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && client.tags.length < 5 && !client.tags.includes(newTag.trim())) {
      setClient((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setClient((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Cloudinary config from environment variables
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return;

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setClient((prev) => ({
          ...prev,
          profilePhoto: data.secure_url,
        }));
      } else {
        alert("Failed to upload image to Cloudinary");
      }
    } catch (err) {
      alert("Failed to upload image");
    }
  }

  const renderEditableField = (
    field: string,
    label: string,
    value: any,
    type: "text" | "email" | "tel" | "textarea" | "select" = "text",
    options?: string[],
  ) => {
    const isEditing = editingField === field

    return (
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.fieldContainer}>
          {isEditing ? (
            <div className={styles.editContainer}>
              {type === "textarea" ? (
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className={styles.editInput}
                  rows={3}
                />
              ) : type === "select" ? (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} className={styles.editSelect}>
                  {options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className={styles.editInput}
                />
              )}
              <div className={styles.editActions}>
                <button onClick={() => handleSave(field)} className={styles.saveBtn}>
                  Save
                </button>
                <button onClick={handleCancel} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.fieldValue}>
              <span className={styles.valueText}>{value || "Not specified"}</span>
              <button onClick={() => handleEdit(field, value)} className={styles.editIcon}>
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Save handler for creating or updating a client
  const handleSaveClient = async () => {
    try {
      const clientToSave = { ...client, user: user.id }
      let res;
      if (client._id) {
        // Update existing client
        res = await fetch(`${API_ROUTES.CLIENTS.CREATE}/${client._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(clientToSave),
        })
      } else {
        // Create new client
        res = await fetch(API_ROUTES.CLIENTS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(clientToSave),
        })
      }
      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.message || 'Failed to save client')
        return
      }
      alert(client._id ? 'Client updated successfully!' : 'Client created successfully!')
      // Optionally refresh or update UI
    } catch (err) {
      alert('Failed to save client')
    }
  }

  return (
    <div className={styles.clientProfile}>
      <div className={styles.profileContainer}>
        {/* Profile Photo Section */}
        <div className={styles.profilePhotoSection}>
          <div
            className={styles.profilePhotoContainer}
            onMouseEnter={() => setIsHoveringPhoto(true)}
            onMouseLeave={() => setIsHoveringPhoto(false)}
          >
            {client.profilePhoto ? (
              <img src={client.profilePhoto} alt={client.name} className={styles.profilePhoto} />
            ) : (
              <div className={styles.profilePhotoPlaceholder}>
                <span className={styles.profileInitial}>{client.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            {isHoveringPhoto && (
              <div className={styles.photoOverlay}>
                <button onClick={() => fileInputRef.current?.click()} className={styles.photoEditBtn}>
                  <Camera size={20} />
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className={styles.hiddenFileInput}
          />
        </div>

        {/* Client Details */}
        <div className={styles.clientDetails}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>

            {renderEditableField("name", "Client Name", client.name)}
            {renderEditableField("description", "Description", client.description, "textarea")}
            {renderEditableField("industry", "Industry", client.industry, "select", INDUSTRY_OPTIONS)}

            {/* Status Toggle */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Status</label>
              <div className={styles.fieldContainer}>
                <div className={styles.statusContainer}>
                  <span
                    className={`${styles.statusText} ${client.status === "active" ? styles.active : styles.inactive}`}
                  >
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                  <button
                    onClick={handleStatusToggle}
                    className={`${styles.statusToggle} ${client.status === "active" ? styles.toggleActive : styles.toggleInactive}`}
                  >
                    <div className={styles.toggleSlider}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Tags ({client.tags.length}/5)</label>
              <div className={styles.fieldContainer}>
                <div className={styles.tagsContainer}>
                  <div className={styles.tagsList}>
                    {client.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className={styles.tagRemove}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  {client.tags.length < 5 && (
                    <div className={styles.tagInput}>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="Add tag..."
                        className={styles.tagInputField}
                      />
                      <button onClick={handleAddTag} className={styles.tagAddBtn} disabled={!newTag.trim()}>
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            {renderEditableField("contactPerson.name", "Contact Name", client.contactPerson.name)}
            {renderEditableField("contactPerson.email", "Email", client.contactPerson.email, "email")}
            {/* Display user id (read-only) */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>User ID</label>
              <div className={styles.fieldContainer}>
                <span className={styles.valueText}>{user.id}</span>
              </div>
            </div>
            {renderEditableField("contactPerson.phone", "Phone", client.contactPerson.phone, "tel")}
          </div>

          {/* Billing Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Billing Information</h2>
            {renderEditableField("billingInfo.address", "Address", client.billingInfo.address)}
            {renderEditableField("billingInfo.city", "City", client.billingInfo.city)}
            {renderEditableField("billingInfo.state", "State", client.billingInfo.state)}
            {renderEditableField("billingInfo.zipCode", "ZIP Code", client.billingInfo.zipCode)}
            {renderEditableField("billingInfo.country", "Country", client.billingInfo.country)}
          </div>

          {/* Metadata */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Metadata</h2>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Created At</label>
              <div className={styles.fieldContainer}>
                <span className={styles.valueText}>
                  {new Date(client.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            gap: "20px",
          }}>
            <button style={{width:'100%', backgroundColor:'white', color:'black'}} onClick={handleSaveClient}>Save</button>
            <button style={{width:'100%'}}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  )
}
