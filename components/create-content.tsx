export interface CreateContentFormData {
  // Step 1
  title: string
platforms: string[]
  clients: string[]

  // Step 2
  content: string
  tags: string[]
  links: Array<{ text: string; url: string }>
  attachments: File[]
  existingMedia: MediaItem[];
  aiEnabled: boolean
  aiInstructions: string

  // Step 3
  dueDate: string
  time: string
  status: string
}

export interface ValidationErrors {
  [key: string]: string
}

interface MediaItem {
  url: string;
  publicId: string;
  name: string;
  type: string;
}