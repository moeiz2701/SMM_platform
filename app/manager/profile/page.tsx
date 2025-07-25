// ManagerProfile.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import API_ROUTES from "@/app/apiRoutes"
import styles from "../../../styling/clientProfile.module.css"
import { Edit2, Camera } from "lucide-react"

interface SocialMedia {
  linkedin: string
  facebook: string
  twitter: string
  instagram: string
}

interface Manager {
  _id: string
  name: string
  email: string
  phone: string
  department: string
  status: "active" | "inactive"
  profilePhoto: string
  website: string
  socialMedia: SocialMedia
  managedClients: string[]
  createdAt: string
  user: string
}

export default function ManagerProfile({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<{ name: string; email: string; id: string }>({ name: '', email: '', id: '' })
  const [manager, setManager] = useState<Manager>({
    _id: params.id,
    name: "",
    email: "",
    phone: "",
    department: "",
    status: "active",
    profilePhoto: "",
    website: "",
    socialMedia: { linkedin: "", facebook: "", twitter: "", instagram: "" },
    managedClients: [],
    createdAt: new Date().toISOString(),
    user: "",
  })
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<any>("")
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserAndManager = async () => {
      try {
        const res = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const userId = data.data?._id || ''
        setUser({
          name: data.data?.name || '',
          email: data.data?.email || '',
          id: userId,
        })
        if (userId) {
          // Use GET_BY_USER route to fetch the manager info for the current logged-in user
          const managerRes = await fetch(API_ROUTES.MANAGERS.GET_BY_USER(userId), { credentials: 'include' })
          if (managerRes.ok) {
            const managerData = await managerRes.json()
            if (managerData.data) setManager(managerData.data)
          }
        }
      } catch (e) {}
    }
    fetchUserAndManager()
  }, [])

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSave = (field: string) => {
    if (field.startsWith("socialMedia.")) {
      const key = field.split(".")[1]
      setManager((prev) => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [key]: tempValue,
        },
      }))
    } else {
      setManager((prev) => ({ ...prev, [field]: tempValue }))
    }
    setEditingField(null)
    setTempValue("")
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue("")
  }

  const handleStatusToggle = () => {
    setManager((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }))
  }

  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.secure_url) {
        setManager((prev) => ({ ...prev, profilePhoto: data.secure_url }))
      } else alert("Failed to upload image to Cloudinary")
    } catch (err) {
      alert("Failed to upload image")
    }
  }

  const renderEditableField = (
    field: string,
    label: string,
    value: any,
    type: "text" | "email" | "tel" | "url" = "text"
  ) => {
    const isEditing = editingField === field
    return (
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.fieldContainer}>
          {isEditing ? (
            <div className={styles.editContainer}>
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className={styles.editInput}
              />
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={() => handleSave(field)}>Save</button>
                <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.fieldValue}>
              <span className={styles.valueText}>{value || "Not specified"}</span>
              <button className={styles.editIcon} onClick={() => handleEdit(field, value)}>
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleSaveManager = async () => {
    try {
      const managerToSave = { ...manager, user: user.id }
      const res = manager._id
        ? await fetch(`${API_ROUTES.MANAGERS.UPDATE(manager._id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(managerToSave),
          })
        : await fetch(API_ROUTES.MANAGERS.CREATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(managerToSave),
          })
      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.message || 'Failed to save manager')
        return
      }
      alert('Manager saved successfully!')
    } catch (err) {
      alert('Failed to save manager')
    }
  }

  return (
    <div className={styles.clientProfile}>
      <div className={styles.profileContainer}>
        <div className={styles.profilePhotoSection}>
          <div
            className={styles.profilePhotoContainer}
            onMouseEnter={() => setIsHoveringPhoto(true)}
            onMouseLeave={() => setIsHoveringPhoto(false)}
          >
            {manager.profilePhoto ? (
              <img src={manager.profilePhoto} alt={manager.name} className={styles.profilePhoto} />
            ) : (
              <div className={styles.profilePhotoPlaceholder}>
                <span className={styles.profileInitial}>{manager.name.charAt(0).toUpperCase()}</span>
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

        <div className={styles.clientDetails}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            {/* Editable manager name/email for current logged-in user's manager info */}
            {renderEditableField("name", "Manager Name", manager.name || user.name)}
            {renderEditableField("email", "Email", manager.email || user.email, "email")}
            {renderEditableField("phone", "Phone", manager.phone, "tel")}
            {renderEditableField("department", "Department", manager.department)}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Status</label>
              <div className={styles.fieldContainer}>
                <span className={`${styles.statusText} ${manager.status === "active" ? styles.active : styles.inactive}`}>
                  {manager.status.charAt(0).toUpperCase() + manager.status.slice(1)}
                </span>
                <button
                  onClick={handleStatusToggle}
                  className={`${styles.statusToggle} ${manager.status === "active" ? styles.toggleActive : styles.toggleInactive}`}
                >
                  <div className={styles.toggleSlider}></div>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Web & Social</h2>
            {renderEditableField("website", "Website", manager.website, "url")}
            {renderEditableField("socialMedia.linkedin", "LinkedIn", manager.socialMedia.linkedin, "url")}
            {renderEditableField("socialMedia.facebook", "Facebook", manager.socialMedia.facebook, "url")}
            {renderEditableField("socialMedia.twitter", "Twitter", manager.socialMedia.twitter, "url")}
            {renderEditableField("socialMedia.instagram", "Instagram", manager.socialMedia.instagram, "url")}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Managed Clients</h2>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Clients</label>
              <div className={styles.fieldContainer}>
                {manager.managedClients.length ? (
                  <ul>
                    {manager.managedClients.map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                ) : (
                  <span className={styles.valueText}>No clients assigned</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <button className={styles.saveButton} onClick={handleSaveManager}>Save Manager</button>
          </div>
        </div>
      </div>
    </div>
  )
}