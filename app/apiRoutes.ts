// This file centralizes your backend API endpoints for easy import and usage in your frontend code.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const API_ROUTES = {
  MESSAGES: `${API_BASE_URL}/messages`,
  START_CONVERSATION: `${API_BASE_URL}/messages/start`,
  GET_CONVERSATION: (id: string) => `${API_BASE_URL}/messages/${id}`,
  READ: (id: string) => `${API_BASE_URL}/messages/read/${id}`,

  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgotpassword`,
    RESET_PASSWORD: (token: string) => `${API_BASE_URL}/auth/resetpassword/${token}`,
    UPDATE_DETAILS: `${API_BASE_URL}/auth/updatedetails`,
    UPDATE_PASSWORD: `${API_BASE_URL}/auth/updatepassword`,
    GET_ALL_USERS: `${API_BASE_URL}/auth/all-users`
  },

  CLIENTS: {
    CREATE: `${API_BASE_URL}/clients`,
    GET_ALL: `${API_BASE_URL}/clients`,
    BY_USER: (userId: string) => `${API_BASE_URL}/clients/user/${userId}`,
    SEND_REQUEST: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/request`,
    SEND_REQUEST_TO_MANAGER: (managerId: string) => `${API_BASE_URL}/clients/request-manager/${managerId}`,
    GET_REQUESTS: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/requests`,
    ASSIGN_MANAGER: (managerId: string) => `${API_BASE_URL}/clients/assign-manager/${managerId}`,
    DELETE_REQUEST: (clientId: string, requestId: string) => `${API_BASE_URL}/clients/${clientId}/requests/${requestId}`,
    ADD_OR_UPDATE_BILLING: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/billing`,
    ADD_PAYMENT_METHOD: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/payment-method`,
    ME: `${API_BASE_URL}/clients/me`,
    ME_MANAGER: `${API_BASE_URL}/clients/me/manager`,
    GET_BY_IDS: `${API_BASE_URL}/clients/by-ids`,
    BY_MANAGER: `${API_BASE_URL}/clients/manager/clients`,
  },

  SOCIAL_ACCOUNTS: {
    ADD: (platform: string) => `${API_BASE_URL}/social-accounts/${platform}`,
    DELETE: (platform: string) => `${API_BASE_URL}/social-accounts/${platform}`,
    GET_ALL: `${API_BASE_URL}/social-accounts`,
    CLIENT:(clientId: string) => `${API_BASE_URL}/social-accounts/client/${clientId}`
  },

  MANAGERS: {
    CREATE: `${API_BASE_URL}/managers`,
    GET_ALL: `${API_BASE_URL}/managers`,
    GET_ONE: (id: string) => `${API_BASE_URL}/managers/${id}`,
    GET_BY_USER: (userId: string) => `${API_BASE_URL}/managers/user/${userId}`,
    UPDATE: (id: string) => `${API_BASE_URL}/managers/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/managers/${id}`,
    GET_CLIENTS: `${API_BASE_URL}/managers/clients`,
    ME:`${API_BASE_URL}/managers/MyManager`,
    MY_REQUESTS: `${API_BASE_URL}/managers/me/requests`,
    ACCEPT_REQUEST: (clientId: string) => `${API_BASE_URL}/managers/accept-request/${clientId}`,
    DECLINE_REQUEST: (clientId: string) => `${API_BASE_URL}/managers/decline-request/${clientId}`
  },

POSTS: {
  CREATE: `${API_BASE_URL}/posts`,
  GET_ALL: `${API_BASE_URL}/posts`,
  GET_ONE: (id: string) => `${API_BASE_URL}/posts/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/posts/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/posts/${id}`,
  BY_CLIENT: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/posts`,
  BY_MANAGER: (managerId: string) => `${API_BASE_URL}/posts/by-manager/${managerId}`,
  ADD_CLIENT: (id: string) => `${API_BASE_URL}/managers/${id}/clients`,
    
},
 AD_CAMPAIGNS: {
    CREATE: `${API_BASE_URL}/ad-campaigns`,
    GET_ALL: `${API_BASE_URL}/ad-campaigns`,
    GET_ONE: (id: string) => `${API_BASE_URL}/ad-campaigns/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/ad-campaigns/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/ad-campaigns/${id}`,
    PAUSE: (id: string) => `${API_BASE_URL}/ad-campaigns/${id}/pause`,
    RESUME: (id: string) => `${API_BASE_URL}/ad-campaigns/${id}/resume`,
    ARCHIVE: (id: string) => `${API_BASE_URL}/ad-campaigns/${id}/archive`,
  },

  AD_BUDGET:{
    GET_ALL: `${API_BASE_URL}/budgets`,
    GET: (id: string) => `${API_BASE_URL}/budgets/${id}`
  },

  INVOICES:{
    GET_ALL: `${API_BASE_URL}/invoices`,
    GET_BY_MANAGER: `${API_BASE_URL}/invoices/manager`,
    GET_BY_CLIENT: `${API_BASE_URL}/invoices/client`,
    GET: (id: string) =>`${API_BASE_URL}/invoices/invoiceDetails/${id}`,
    PAY: (id: string) => `${API_BASE_URL}/invoices/${id}/pay`,
    CONFIRM_PAYMENT: (id: string) => `${API_BASE_URL}/invoices/${id}/confirm-payment`,
  },

  NOTIFICATIONS: {
    GET_ALL: `${API_BASE_URL}/notifications`,
    GET_UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
    MARK_AS_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
    PROCESS_ACTION: (id: string) => `${API_BASE_URL}/notifications/${id}/action`
  }

  
};

export default API_ROUTES;
