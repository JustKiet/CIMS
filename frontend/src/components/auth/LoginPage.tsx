"use client"

import React from 'react'
import { LoginForm } from './LoginForm'
import { LoginBackground } from './LoginBackground'

interface LoginPageProps {
  onLogin?: (credentials: { username: string; password: string }) => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleLogin = (credentials: { username: string; password: string }) => {
    // Handle login logic here
    console.log('Login attempt:', credentials)
    if (onLogin) {
      onLogin(credentials)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Background with Logo */}
      <div className="hidden lg:flex lg:w-1/2">
        <LoginBackground />
      </div>

      {/* Right Half - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#FFFAF4' }}>
        <div className="w-full max-w-md">
          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>

      {/* Mobile background overlay for smaller screens */}
      <div className="lg:hidden absolute inset-0 z-0">
        <LoginBackground />
      </div>
      
      {/* Mobile form overlay */}
      <div className="lg:hidden absolute inset-0 z-10 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-[#FFFAF4] rounded-lg p-8 shadow-xl">
          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  )
}
