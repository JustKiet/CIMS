"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TokenManager } from '@/lib/api'

export function AuthDebugPanel() {
  const { user, isLoading, isAuthenticated, error } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only access TokenManager on client side after mounting
  const tokenData = mounted ? TokenManager.getTokenData() : null
  const isExpired = mounted ? TokenManager.isTokenExpired() : false

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Panel</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.name : 'None'}</div>
        <div>Role: {user ? user.role : 'None'}</div>
        <div>Error: {error || 'None'}</div>
        <div>Token: {mounted ? (tokenData ? 'Present' : 'None') : 'Loading...'}</div>
        <div>Token Expired: {mounted ? (isExpired ? 'Yes' : 'No') : 'Loading...'}</div>
        {mounted && tokenData && (
          <div>
            <div>Expires (UTC): {new Date(tokenData.expires_at + (tokenData.expires_at.endsWith('Z') ? '' : 'Z')).toISOString()}</div>
            <div>Expires (Local): {new Date(tokenData.expires_at + (tokenData.expires_at.endsWith('Z') ? '' : 'Z')).toLocaleString()}</div>
            <div>Current (UTC): {new Date().toISOString()}</div>
            <div>Current (Local): {new Date().toLocaleString()}</div>
          </div>
        )}
      </div>
      <button 
        onClick={() => {
          console.log('Current auth state:', {
            user,
            isLoading,
            isAuthenticated,
            error,
            tokenData,
            isExpired
          })
        }}
        className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
      >
        Log State
      </button>
    </div>
  )
}
