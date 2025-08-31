"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface UserDetails {
  id: string
  username: string
  email: string
  roleNames: string
  isAuthenticated: boolean
}

export interface AuthContextValue {
  userDetails: UserDetails | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading user from localStorage or API
    const mockUser: UserDetails = {
      id: "1",
      username: "testuser",
      email: "test@example.com",
      roleNames: "Admin, ServiceResiliency", // Mock roles - change this to test different access levels
      isAuthenticated: true,
    }

    setTimeout(() => {
      setUserDetails(mockUser)
      setIsLoading(false)
    }, 1000)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock login logic
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: UserDetails = {
        id: "1",
        username,
        email: `${username}@example.com`,
        roleNames: "Admin, ServiceResiliency", // Mock successful login with admin role
        isAuthenticated: true,
      }

      setUserDetails(mockUser)
    } catch (err) {
      setError("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUserDetails(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        userDetails,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
