"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "../../../styling/ClientManager.module.css"
import API_ROUTES from '../../apiRoutes'

// Mock data - replace with actual API calls
type Manager = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  profilePhoto: string;
  website: string;
  socialMedia: {
    linkedin: string;
    facebook: string;
    twitter: string;
    instagram: string;
  };
  experience: number;
  rating: number;
  managedClients: string[]; // or populated array of Client objects
  createdAt: string;
};


// Mock data - replace with actual API calls

export default function ClientManagerPage() {
  const [currentManager, setCurrentManager] = useState<Manager | null>(null)
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showManagerDetails, setShowManagerDetails] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate checking if client has a manager
   useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await fetch(API_ROUTES.MANAGERS.GET_ALL, {
          credentials: 'include'
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setManagers(data.data);
        } else {
          console.error("Failed to fetch managers:", data.message);
        }
      } catch (err) {
        console.error("Error fetching managers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const handleSelectManager = (manager: Manager) => {
    setSelectedManager(manager)
    setShowManagerDetails(true)
  }

  const handleAssignManager = async (managerId: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const manager = managers.find((m) => m._id === managerId)
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
  /*if (currentManager) {
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
            { <div className={styles.managerAvatar}>
              <Image
                src={currentManager.avatar || "/placeholder.svg"}
                alt={currentManager.name}
                width={120}
                height={120}
                className={styles.avatarImage}
              />
            </div>
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
  } */

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Select Your Manager</h1>
        <div className={styles.headerContent}>
          <p>Choose from our experienced team of account managers to guide your journey.</p>
        </div>
      </div>

      <div className={styles.managersGrid}>
        {managers.map((manager) => (
          <div key={manager._id} className={styles.managerCard}>
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
              {/*<div className={styles.availabilityBadge}>
                <span
                  className={`${styles.statusBadge} ${
                    manager.availability === "Available" ? styles.statusAvailable : styles.statusBusy
                  }`}
                >
                  {manager.availability}
                </span>
              </div>*/}
            </div>

            <div className={styles.cardContent}>
                <h3 className={styles.managerName}>{manager.user.name}</h3>
                <p className={styles.specialization}>{manager.department}</p>

                {manager.website && (
                  <p className={styles.bio}>
                    <strong>Website:</strong>{" "}
                    <a href={manager.website} target="_blank" rel="noopener noreferrer">
                      {manager.website}
                    </a>
                  </p>
                )}

                <div className={styles.managerMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricIcon}>⭐</span>
                    <span className={styles.metricValue}>{manager.rating.toFixed(1)}</span>
                    <span className={styles.metricLabel}>Rating</span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricIcon}>📞</span>
                    <span className={styles.metricValue}>{manager.phone || "N/A"}</span>
                    <span className={styles.metricLabel}>Phone</span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricIcon}>🧑‍💼</span>
                    <span className={styles.metricValue}>{manager.experience}</span>
                    <span className={styles.metricLabel}>Years Exp.</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.viewDetailsButton}
                    onClick={() => handleSelectManager(manager)}
                  >
                    View Details
                  </button>

                  <button
                    className={styles.selectButton}
                    onClick={() => handleAssignManager(manager._id)}
                    disabled={isLoading || manager.status === "inactive"}
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
          <div className={styles.managerAvatar}>
            <img
              src={selectedManager.profilePhoto || "/placeholder.svg"}
              alt={selectedManager.user.name}
              width={100}
              height={100}
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.managerDetails}>
            <h3>{selectedManager.user.name}</h3>
            <p className={styles.specialization}>{selectedManager.department}</p>
            <p className={styles.experience}>{selectedManager.experience} years experience</p>
          </div>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.detailSection}>
            <h4>Rating</h4>
            <p>⭐ {selectedManager.rating} / 5</p>
          </div>

          <div className={styles.detailSection}>
            <h4>Contact</h4>
            <p>
              <strong>Email:</strong> {selectedManager.user.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedManager.phone || "N/A"}
            </p>
            <p>
              <strong>Website:</strong>{" "}
              {selectedManager.website ? (
                <a href={selectedManager.website} target="_blank" rel="noopener noreferrer">
                  {selectedManager.website}
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>

          <div className={styles.detailSection}>
            <h4>Social Media</h4>
            <ul className={styles.socialLinks}>
              {Object.entries(selectedManager.socialMedia || {}).map(([platform, url]) =>
                url ? (
                  <li key={platform}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          <div className={styles.detailSection}>
            <h4>Status</h4>
            <p>{selectedManager.status === "active" ? "✅ Active" : "❌ Inactive"}</p>
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.cancelButton} onClick={() => setShowManagerDetails(false)}>
          Cancel
        </button>
        <button
          className={styles.selectButton}
          onClick={() => handleAssignManager(selectedManager._id)}
          disabled={isLoading || selectedManager.status === "inactive"}
        >
          {isLoading ? "Assigning..." : "Select This Manager"}
        </button>
      </div>
    </div>
  </div>
)}
</div>

  )}

