
"use client"

import "@/styling/ManagerDashboard.css"

import { Heart, MessageCircle, Share2, TrendingUp } from "lucide-react"

interface Post {
  id: number
  platform: "instagram" | "facebook" | "twitter"
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  engagement: number
  timeAgo: string
}

const topPosts: Post[] = [
  {
    id: 1,
    platform: "instagram",
    content: "Summer collection launch! 🌞 Check out our latest designs that will make you shine this season.",
    likes: 1240,
    comments: 89,
    shares: 156,
    engagement: 8.5,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    platform: "facebook",
    content: "Behind the scenes of our photoshoot! Our team worked incredibly hard to bring this vision to life.",
    likes: 892,
    comments: 67,
    shares: 134,
    engagement: 7.2,
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    platform: "twitter",
    content: "Just dropped: Our sustainability report for 2024. We're proud of the progress we've made! 🌱",
    likes: 567,
    comments: 45,
    shares: 89,
    engagement: 6.8,
    timeAgo: "1 day ago",
  },
]

export default function TopPosts() {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "#e1306c"
      case "facebook":
        return "#1877f2"
      case "twitter":
        return "#1da1f2"
      default:
        return "#6b7280"
    }
  }

  const getPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }

  return (
    <div className="top-posts">
      <div className="posts-header">
        <div className="header-title">
          <TrendingUp size={20} />
          <h3>Top Performing Posts</h3>
        </div>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="posts-list">
        {topPosts.map((post, index) => (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <div className="platform-badge" style={{ backgroundColor: getPlatformColor(post.platform) }}>
                {getPlatformName(post.platform)}
              </div>
              <div className="post-rank">#{index + 1}</div>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
            </div>

            <div className="post-stats">
              <div className="stat-item">
                <Heart size={16} />
                <span>{post.likes.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <MessageCircle size={16} />
                <span>{post.comments}</span>
              </div>
              <div className="stat-item">
                <Share2 size={16} />
                <span>{post.shares}</span>
              </div>
              <div className="engagement-rate">{post.engagement}% engagement</div>
            </div>

            <div className="post-footer">
              <span className="time-ago">{post.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* styles moved to ManagerDashboard.css */}
    </div>
  )
}
