// This file centralizes your backend API endpoints for easy import and usage in your frontend code.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const API_ROUTES = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgotpassword`,
    RESET_PASSWORD: (token: string) => `${API_BASE_URL}/auth/resetpassword/${token}`,
    UPDATE_DETAILS: `${API_BASE_URL}/auth/updatedetails`,
    UPDATE_PASSWORD: `${API_BASE_URL}/auth/updatepassword`,
  },

  CLIENTS: {
    CREATE: `${API_BASE_URL}/clients`,
    GET_ALL: `${API_BASE_URL}/clients`,
    BY_USER: (userId: string) => `${API_BASE_URL}/clients/user/${userId}`,
    SEND_REQUEST: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/request`,
    GET_REQUESTS: (clientId: string) => `${API_BASE_URL}/clients/${clientId}/requests`,
    ASSIGN_MANAGER: (managerId: string) => `${API_BASE_URL}/clients/assign-manager/${managerId}`,
    DELETE_REQUEST: (clientId: string, requestId: string) => `${API_BASE_URL}/clients/${clientId}/requests/${requestId}`,
  },

  SOCIAL_ACCOUNTS: {
    ADD: (platform: string) => `${API_BASE_URL}/social-accounts/${platform}`,
    DELETE: (platform: string) => `${API_BASE_URL}/social-accounts/${platform}`,
    GET_ALL: `${API_BASE_URL}/social-accounts`,
  },

  MANAGERS: {
    CREATE: `${API_BASE_URL}/managers`,
    GET_ALL: `${API_BASE_URL}/managers`,
    GET_ONE: (id: string) => `${API_BASE_URL}/managers/${id}`,
    GET_BY_USER: (userId: string) => `${API_BASE_URL}/managers/user/${userId}`,
    UPDATE: (id: string) => `${API_BASE_URL}/managers/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/managers/${id}`,
    GET_CLIENTS: (id: string) => `${API_BASE_URL}/managers/${id}/clients`,
  },
};

export default API_ROUTES;
