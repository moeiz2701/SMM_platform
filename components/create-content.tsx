export interface CreateContentFormData {
  // Step 1
  title: string
  type: string
  platform: string
  client: string

  // Step 2
  content: string
  tags: string[]
  links: Array<{ text: string; url: string }>
  attachments: File[]
  aiEnabled: boolean
  aiInstructions: string

  // Step 3
  assignedTo: string
  dueDate: string
  time: string
  status: string
}

export interface ValidationErrors {
  [key: string]: string
}
