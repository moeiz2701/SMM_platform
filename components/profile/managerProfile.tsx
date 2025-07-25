import styles from "@/styling/profileDisplay.module.css"
import { Phone, Building2, Globe, Linkedin, Facebook, Twitter, Instagram, Users, Calendar } from "lucide-react"

// Mock data - in real app this would come from your database
const mockManagerData = {
  user: {
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
  },
  phone: "+1 (555) 123-4567",
  department: "Marketing",
  status: "active",
  profilePhoto: "/placeholder.svg?height=120&width=120",
  website: "https://sarahjohnson.dev",
  socialMedia: {
    linkedin: "https://linkedin.com/in/sarahjohnson",
    facebook: "https://facebook.com/sarahjohnson",
    twitter: "https://twitter.com/sarahjohnson",
    instagram: "https://instagram.com/sarahjohnson",
  },
  managedClients: ["Client A", "Client B", "Client C", "Client D", "Client E"],
  createdAt: "2023-01-15T10:30:00Z",
}

export default function ProfilePage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.profileImageContainer}>
            <img
              src={mockManagerData.profilePhoto || "/placeholder.svg"}
              alt={`${mockManagerData.user.name} profile`}
              className={styles.profileImage}
            />
            <div className={`${styles.statusBadge} ${styles[mockManagerData.status]}`}>{mockManagerData.status}</div>
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{mockManagerData.user.name}</h1>
            <p className={styles.email}>{mockManagerData.user.email}</p>
            <p className={styles.department}>{mockManagerData.department}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <Phone className={styles.icon} />
              <span>{mockManagerData.phone}</span>
            </div>
            <div className={styles.contactItem}>
              <Building2 className={styles.icon} />
              <span>{mockManagerData.department}</span>
            </div>
            <div className={styles.contactItem}>
              <Globe className={styles.icon} />
              <a href={mockManagerData.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {mockManagerData.website}
              </a>
            </div>
            <div className={styles.contactItem}>
              <Calendar className={styles.icon} />
              <span>Joined {formatDate(mockManagerData.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Social Media</h2>
          <div className={styles.socialGrid}>
            {mockManagerData.socialMedia.linkedin && (
              <a
                href={mockManagerData.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Linkedin className={styles.socialIcon} />
                <span>LinkedIn</span>
              </a>
            )}
            {mockManagerData.socialMedia.twitter && (
              <a
                href={mockManagerData.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Twitter className={styles.socialIcon} />
                <span>Twitter</span>
              </a>
            )}
            {mockManagerData.socialMedia.facebook && (
              <a
                href={mockManagerData.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Facebook className={styles.socialIcon} />
                <span>Facebook</span>
              </a>
            )}
            {mockManagerData.socialMedia.instagram && (
              <a
                href={mockManagerData.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Instagram className={styles.socialIcon} />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        {/* Managed Clients */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Managed Clients ({mockManagerData.managedClients.length})
          </h2>
          <div className={styles.clientsGrid}>
            {mockManagerData.managedClients.map((client, index) => (
              <div key={index} className={styles.clientCard}>
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
