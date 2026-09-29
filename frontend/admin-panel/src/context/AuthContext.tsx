import React, { useCallback, useEffect, useState } from 'react'
import type { AdminUser } from '../services/api/types'
import { authService } from '../services/auth/authService'
import { ADMIN_UNAUTHORIZED_EVENT } from '../services/api/apiClient'
import { AuthContext } from './authContextDef'
import type { AuthContextValue } from './authContextDef'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    authService
      .checkSession()
      .then((activeUser) => {
        if (isMounted) {
          setUser(activeUser)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      })

    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null)
      }
    }

    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => {
      isMounted = false
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (password: string) => {
    const loggedUser = await authService.login(password)
    setUser(loggedUser)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user?.authenticated),
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
