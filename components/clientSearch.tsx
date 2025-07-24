"use client"

import { useState, useEffect } from "react"
import API_ROUTES from "@/app/apiRoutes"
import Image from "next/image"
import { Search, Mail, Phone } from "lucide-react"
import "../styling/searchClient.css"
// Define the Client type based on your schema
interface Client {
  _id: string
  name: string
  description?: string
  industry?: string
  contactPerson?: {
    name?: string
    email?: string
    phone?: string
  }
  profilePhoto?: string
  tags?: string[]
  status: "active" | "inactive"
  _sendingRequest?: boolean // UI state only
}

export default function SearchClients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // Fetch clients for the current user on component mount (same logic as manager client page)
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true)
      try {
        // Get current user id
        const userRes = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' })
        const userData = await userRes.json()
        const userId = userData.data?._id
        if (!userId) {
          setClients([])
          setFilteredClients([])
          setIsLoading(false)
          return
        }
        // Fetch clients for this user
        const res = await fetch(API_ROUTES.CLIENTS.
            GET_ALL, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setClients(data.data || [])
          setFilteredClients(data.data || [])
        } else {
          setClients([])
          setFilteredClients([])
        }
      } catch (error) {
        setClients([])
        setFilteredClients([])
      }
      setIsLoading(false)
    }
    fetchClients()
  }, [])

  // Filter clients based on search term (email)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients)
      return
    }

    const filtered = clients.filter((client) => {
      const email = client.contactPerson?.email?.toLowerCase() || ""
      return email.includes(searchTerm.toLowerCase())
    })

    setFilteredClients(filtered)
  }, [searchTerm, clients])

  return (
    <div className="search-clients-container">
      <div className="search-bar">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search clients by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          
        />
      </div>

      {isLoading ? (
        <div className="loading-state">Loading clients...</div>
      ) : (
        <div className="clients-grid">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client._id} className="client-card" style={{ position: 'relative' }}>
                <div className="client-header" style={{ position: 'relative' }}>
                  <div className="client-avatar">
                    {client.profilePhoto ? (
                      <Image
                        src={client.profilePhoto || "/placeholder.svg"}
                        alt={`${client.name}'s profile`}
                        className="profile-photo"
                        width={48}
                        height={48}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="profile-placeholder">{client.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="client-info">
                    <h3 className="client-name">{client.name}</h3>
                    {client.industry && <p className="client-industry">{client.industry}</p>}
                  </div>
                  <button
                    className="button2"
                    style={{ position: 'absolute', top: 0, right: 0, backgroundColor:'white', color:'black', padding:'5px'}}
                    disabled={client._sendingRequest}
                    onClick={async () => {
                      // Optimistic UI: set sending state
                      setFilteredClients((prev) => prev.map(c => c._id === client._id ? { ...c, _sendingRequest: true } : c));
                      try {
                        const res = await fetch(API_ROUTES.CLIENTS.SEND_REQUEST(client._id), {
                          method: 'POST',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                        });
                        if (res.ok) {
                          alert('Request sent successfully!');
                        } else {
                          const data = await res.json();
                          alert(data.message || 'Failed to send request');
                        }
                      } catch (err) {
                        alert('Failed to send request');
                      }
                      setFilteredClients((prev) => prev.map(c => c._id === client._id ? { ...c, _sendingRequest: false } : c));
                    }}
                  >
                    {client._sendingRequest ? 'Sending...' : 'Send Request'}
                  </button>
                </div>

                <div className="client-footer">
                  <div className="client-status">
                    <span className={`status-indicator ${client.status}`}></span>
                    {client.status}
                  </div>
                  <div className="social-icons">
                    {client.contactPerson?.email && (
                      <a href={`mailto:${client.contactPerson.email}`} className="social-icon">
                        <Mail size={16} />
                      </a>
                    )}
                    {client.contactPerson?.phone && (
                      <a href={`tel:${client.contactPerson.phone}`} className="social-icon">
                        <Phone size={16} />
                      </a>
                    )}
                    <a href="#" className="social-icon">
                      <Image src="/icons/linkedin.svg" alt="LinkedIn" width={16} height={16} />
                    </a>
                    <a href="#" className="social-icon">
                      <Image src="/icons/facebook.svg" alt="Facebook" width={16} height={16} />
                    </a>
                    <a href="#" className="social-icon">
                      <Image src="/icons/instagram.svg" alt="Instagram" width={16} height={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No clients found matching your search.</div>
          )}
        </div>
      )}
    </div>
  )
}
