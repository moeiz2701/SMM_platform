"use client"

import { useState, useEffect } from "react"
import styles from "../../../styling/ClientManager.module.css"
import API_ROUTES from '../../apiRoutes'
import ManagerProfile from './managerProfile'

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
  managedClients: string[];
  createdAt: string;
};

type Client = {
  _id: string;
  user: string;
  manager?: string;
};

export default function ClientManagerPage() {
  const [currentManager, setCurrentManager] = useState<Manager | null>(null)
  const [managers, setManagers] = useState<Manager[]>([])
  const [showManagerDetails, setShowManagerDetails] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clientData, setClientData] = useState<Client | null>(null)


useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get client data first
      const clientRes = await fetch(API_ROUTES.CLIENTS.ME, {
        credentials: 'include'
      });
      
      if (!clientRes.ok) throw new Error("Client data failed");
      
      const clientData = await clientRes.json();
      setClientData(clientData.data);

      // 2. Use the NEW endpoint to get manager for this client
      if (clientData.data?._id) {
        const managerRes = await fetch(
          API_ROUTES.MANAGERS.GET_FOR_CLIENT(clientData.data._id), 
          {
            credentials: 'include'
          }
        );
        
        if (!managerRes.ok) throw new Error("Manager fetch failed");
        
        const managerData = await managerRes.json();
        if (managerData.data) {
          setCurrentManager(managerData.data);
        }
      }

      // 3. Get all managers for selection
      const allManagersRes = await fetch(API_ROUTES.MANAGERS.GET_ALL, {
        credentials: 'include'
      });
      
      if (!allManagersRes.ok) throw new Error("Managers list failed");
      
      const allManagersData = await allManagersRes.json();
      setManagers(allManagersData.data);

    } catch (err) {
      console.error("Data loading error:", err);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

  const handleSelectManager = (manager: Manager) => {
    setSelectedManager(manager)
    setShowManagerDetails(true)
  }

  const handleAssignManager = async (managerId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(API_ROUTES.CLIENTS.ASSIGN_MANAGER(managerId), {
        method: 'PUT',
        credentials: 'include'
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        // Update local state with the new manager
        const manager = managers.find(m => m._id === managerId)
        if (manager) {
          setCurrentManager(manager)
          if (clientData) {
            setClientData({...clientData, manager: managerId})
          }
        }
      }
    } catch (err) {
      console.error("Error assigning manager:", err)
    } finally {
      setShowManagerDetails(false)
      setSelectedManager(null)
      setIsLoading(false)
    }
  }

const handleChangeManager = async () => {
  if (!currentManager || !clientData) {
    console.error("Current manager or client data is missing");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to change your manager? You'll need to select a new one."
  );
  if (!confirmed) return;

  setIsLoading(true);
  try {
    const url = API_ROUTES.MANAGERS.REMOVE_CLIENT(currentManager._id, clientData._id);
    console.log('Making request to:', url);

    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check response content type
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    // Update local state
    setCurrentManager(null);
    setClientData({...clientData, manager: undefined});
    
  } catch (err: unknown) {  // Proper TypeScript typing
    let errorMessage = "Failed to change manager";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error("Error changing manager:", errorMessage);
    alert(`Error: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return <div className={styles.main}>Loading...</div>
  }

  // If client has a manager assigned, show their profile
  if (currentManager && clientData?.manager) {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Manager</h1>
          <div className={styles.headerContent}>
            <button className={styles.changeButton} onClick={handleChangeManager}>
              Change Manager
            </button>
          </div>
        </div>
        <ManagerProfile id={currentManager._id} />
      </div>
    )
  }

  // Otherwise, show the manager selection UI
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
  )
}