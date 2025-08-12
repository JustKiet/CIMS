"use client"

import React from 'react'
import { LoginPage } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { login } = useAuth()

  const handleLogin = async (credentials: { username: string; password: string }) => {
    await login(credentials.username, credentials.password)
  }

  return <LoginPage onLogin={handleLogin} />
}