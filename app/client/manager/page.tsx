"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "../../../styling/ClientManager.module.css"

// Mock data - replace with actual API calls
type Manager = {
  id: number
  name: string
  specialization: string
  experience: string
  rating: number
  availability: string
  email: string
  phone: string
  bio: string
  avatar: string
  completedProjects: number
  responseTime: string
  languages: string[]
  certifications: string[]
}

// Mock data - replace with actual API calls
const mockManagers: Manager[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialization: "Digital Marketing",
    experience: "5+ years",
    rating: 4.9,
    availability: "Available",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    bio: "Experienced digital marketing specialist with expertise in social media campaigns, SEO optimization, and content strategy. Helped over 50 clients achieve their marketing goals.",
    avatar: "/placeholder.svg?height=120&width=120",
    completedProjects: 127,
    responseTime: "< 2 hours",
    languages: ["English", "Spanish"],
    certifications: ["Google Ads Certified", "HubSpot Certified"],
  },
  {
    id: 2,
    name: "Michael Chen",
    specialization: "Business Strategy",
    experience: "8+ years",
    rating: 4.8,
    availability: "Available",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
    bio: "Strategic business consultant specializing in growth planning, market analysis, and operational efficiency. MBA from Stanford with extensive Fortune 500 experience.",
    avatar: "/placeholder.svg?height=120&width=120",
    completedProjects: 89,
    responseTime: "< 4 hours",
    languages: ["English", "Mandarin"],
    certifications: ["PMP Certified", "Six Sigma Black Belt"],
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    specialization: "Content Creation",
    experience: "4+ years",
    rating: 4.7,
    availability: "Busy",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    bio: "Creative content strategist with a passion for storytelling and brand development. Specializes in video content, copywriting, and social media management.",
    avatar: "/placeholder.svg?height=120&width=120",
    completedProjects: 156,
    responseTime: "< 6 hours",
    languages: ["English", "French"],
    certifications: ["Adobe Certified Expert", "Content Marketing Institute"],
  },
]

export default function ClientManagerPage() {
  const [currentManager, setCurrentManager] = useState<Manager | null>(null)
  const [availableManagers, setAvailableManagers] = useState<Manager[]>(mockManagers)
  const [showManagerDetails, setShowManagerDetails] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate checking if client has a manager
  useEffect(() => {
    // In real app, this would be an API call to check client's current manager
    const hasManager = false // Change to true to simulate having a manager
    if (hasManager) {
      setCurrentManager(mockManagers[0]) // Simulate assigned manager
    }
  }, [])

  const handleSelectManager = (manager: Manager) => {
    setSelectedManager(manager)
    setShowManagerDetails(true)
  }

  const handleAssignManager = async (managerId: number) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const manager = availableManagers.find((m) => m.id === managerId)
      if (manager) {
        setCurrentManager(manager)
      }
      setShowManagerDetails(false)
      setSelectedManager(null)
      setIsLoading(false)
    }, 1500)
  }

  const handleChangeManager = () => {
    setCurrentManager(null)
    setShowManagerDetails(false)
  }
  if (currentManager) {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Manager</h1>
          <div className={styles.headerContent}>
            <p>Manage your assigned account manager and communication preferences.</p>
            <button className={styles.changeButton} onClick={handleChangeManager}>
              Change Manager
            </button>
          </div>
        </div>

        <div className={styles.currentManagerCard}>
          <div className={styles.managerHeader}>
            {/* <div className={styles.managerAvatar}>
              <Image
                src={currentManager.avatar || "/placeholder.svg"}
                alt={currentManager.name}
                width={120}
                height={120}
                className={styles.avatarImage}
              />
            </div> */}
            <div className={styles.managerInfo}>
              <h2 className={styles.managerName}>{currentManager.name}</h2>
              <p className={styles.specialization}>{currentManager.specialization}</p>
              <div className={styles.managerStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{currentManager.rating}</span>
                  <span className={styles.statLabel}>Rating</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{currentManager.completedProjects}</span>
                  <span className={styles.statLabel}>Projects</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{currentManager.responseTime}</span>
                  <span className={styles.statLabel}>Response</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.managerDetails}>
            <div className={styles.detailSection}>
              <h3>About</h3>
              <p>{currentManager.bio}</p>
            </div>

            <div className={styles.detailSection}>
              <h3>Contact Information</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email:</span>
                  <span className={styles.contactValue}>{currentManager.email}</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Phone:</span>
                  <span className={styles.contactValue}>{currentManager.phone}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Expertise</h3>
              <div className={styles.expertiseGrid}>
                <div className={styles.expertiseItem}>
                  <span className={styles.expertiseLabel}>Experience:</span>
                  <span className={styles.expertiseValue}>{currentManager.experience}</span>
                </div>
                <div className={styles.expertiseItem}>
                  <span className={styles.expertiseLabel}>Languages:</span>
                  <span className={styles.expertiseValue}>{currentManager.languages.join(", ")}</span>
                </div>
              </div>
              <div className={styles.certifications}>
                <span className={styles.expertiseLabel}>Certifications:</span>
                <div className={styles.certificationTags}>
                  {currentManager.certifications.map((cert, index) => (
                    <span key={index} className={styles.certificationTag}>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Select Your Manager</h1>
        <div className={styles.headerContent}>
          <p>Choose from our experienced team of account managers to guide your journey.</p>
        </div>
      </div>

      <div className={styles.managersGrid}>
        {availableManagers.map((manager) => (
          <div key={manager.id} className={styles.managerCard}>
            <div className={styles.cardHeader}>
              {/* <div className={styles.managerAvatar}>
                <Image
                  src={manager.avatar || "/placeholder.svg"}
                  alt={manager.name}
                  width={80}
                  height={80}
                  className={styles.avatarImage}
                />
              </div> */}
              <div className={styles.availabilityBadge}>
                <span
                  className={`${styles.statusBadge} ${
                    manager.availability === "Available" ? styles.statusAvailable : styles.statusBusy
                  }`}
                >
                  {manager.availability}
                </span>
              </div>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.managerName}>{manager.name}</h3>
              <p className={styles.specialization}>{manager.specialization}</p>
              <p className={styles.bio}>{manager.bio}</p>

              <div className={styles.managerMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricIcon}>⭐</span>
                  <span className={styles.metricValue}>{manager.rating}</span>
                  <span className={styles.metricLabel}>Rating</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricIcon}>📊</span>
                  <span className={styles.metricValue}>{manager.completedProjects}</span>
                  <span className={styles.metricLabel}>Projects</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricIcon}>⚡</span>
                  <span className={styles.metricValue}>{manager.responseTime}</span>
                  <span className={styles.metricLabel}>Response</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.viewDetailsButton} onClick={() => handleSelectManager(manager)}>
                  View Details
                </button>
                <button
                  className={styles.selectButton}
                  onClick={() => handleAssignManager(manager.id)}
                  disabled={isLoading || manager.availability === "Busy"}
                >
                  {isLoading ? "Assigning..." : "Select Manager"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showManagerDetails && selectedManager && (
        <div className={styles.modalOverlay} onClick={() => setShowManagerDetails(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manager Details</h2>
              <button className={styles.closeButton} onClick={() => setShowManagerDetails(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalManagerInfo}>
                {/* <div className={styles.managerAvatar}>
                  <Image
                    src={selectedManager.avatar || "/placeholder.svg"}
                    alt={selectedManager.name}
                    width={100}
                    height={100}
                    className={styles.avatarImage}
                  />
                </div> */}
                <div className={styles.managerDetails}>
                  <h3>{selectedManager.name}</h3>
                  <p className={styles.specialization}>{selectedManager.specialization}</p>
                  <p className={styles.experience}>{selectedManager.experience} experience</p>
                </div>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.detailSection}>
                  <h4>About</h4>
                  <p>{selectedManager.bio}</p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Contact</h4>
                  <p>
                    <strong>Email:</strong> {selectedManager.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedManager.phone}
                  </p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Languages</h4>
                  <p>{selectedManager.languages.join(", ")}</p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Certifications</h4>
                  <div className={styles.certificationTags}>
                    {selectedManager.certifications.map((cert, index) => (
                      <span key={index} className={styles.certificationTag}>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowManagerDetails(false)}>
                Cancel
              </button>
              <button
                className={styles.selectButton}
                onClick={() => handleAssignManager(selectedManager.id)}
                disabled={isLoading || selectedManager.availability === "Busy"}
              >
                {isLoading ? "Assigning..." : "Select This Manager"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
