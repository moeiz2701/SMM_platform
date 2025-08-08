import { API_ROUTES } from "@/app/apiRoutes"

export interface User {
  _id: string
  name: string
  email: string
  role: string
}

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(API_ROUTES.AUTH.ME, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        return result.data
      }
    }
    return null
  } catch (err) {
    console.error('Error getting current user:', err)
    return null
  }
}

/**
 * Make an authenticated API request
 */
export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token')
  return !!token
}

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}
