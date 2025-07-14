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
  // Add other resource routes as needed
};

export default API_ROUTES;
