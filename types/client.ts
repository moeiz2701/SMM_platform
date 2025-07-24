export interface Client {
    _id: string;
    name: string;
    description?: string;
    industry?: string;
  
    contactPerson?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  
    billingInfo?: {
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  
    status?: "active" | "inactive" | "pending" | string;
    tags?: string[];
  
    profilePhoto?: string;
    createdAt?: string;
    updatedAt?: string;
  
    user?: string;     // refers to user ID who created the client
    manager?: string;  // manager assigned to the client
  }
  