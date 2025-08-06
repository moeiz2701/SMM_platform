"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "../../../styling/ClientManager.module.css"
import API_ROUTES from '../../apiRoutes'
import ManagerProfilePage from "./managerProfile"

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
  const [isLoading, setIsLoading] = useState(true)

  // Check if client already has a manager
  useEffect(() => {
    const fetchCurrentManager = async () => {
      try {
        const res = await fetch(API_ROUTES.CLIENTS.ME_MANAGER, {
          credentials: 'include'
        });

        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setCurrentManager(data.data);
          setIsLoading(false);
          return; // If manager exists, don't fetch all managers
        }
      } catch (err) {
        console.error("Error fetching current manager:", err);
      }

      // If no current manager, fetch all available managers
      fetchManagers();
    };

    fetchCurrentManager();
  }, []);

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

  const handleSelectManager = (manager: Manager) => {
    setSelectedManager(manager)
    setShowManagerDetails(true)
  }

  const handleAssignManager = async (managerId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(API_ROUTES.CLIENTS.SEND_REQUEST_TO_MANAGER(managerId), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Request sent successfully to manager! They will be notified and can accept or decline your request.`);
        setShowManagerDetails(false);
        setSelectedManager(null);
      } else {
        console.error("Failed to send request to manager:", data.message);
        alert(data.message || "Failed to send request to manager. Please try again.");
      }
    } catch (err) {
      console.error("Error sending request to manager:", err);
      alert("Error sending request to manager. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChangeManager = () => {
    setCurrentManager(null)
    setShowManagerDetails(false)
    // Fetch all managers when changing manager
    fetchManagers()
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    )
  }

  // If client has a current manager, show manager profile
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

        <ManagerProfilePage id={currentManager._id} />
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Request a Manager</h1>
        <div className={styles.headerContent}>
          <p>Send requests to our experienced team of account managers. They will review and respond to your request.</p>
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
                    {isLoading ? "Sending Request..." : "Send Request"}
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
          {isLoading ? "Sending Request..." : "Send Request to Manager"}
        </button>
      </div>
    </div>
  </div>
)}
</div>

  )}

