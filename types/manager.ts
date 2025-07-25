export interface Manager {
  _id: string;
  user: string; // refers to user ID
  phone?: string;
  department?: string;
  status?: 'active' | 'inactive' | string;
  profilePhoto?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  managedClients?: string[]; // array of client IDs
  requests?: Array<{
    manager: string; // user ID
    date?: string;
    status?: 'pending' | 'approved' | 'rejected' | string;
  }>;
  createdAt?: string;
}
