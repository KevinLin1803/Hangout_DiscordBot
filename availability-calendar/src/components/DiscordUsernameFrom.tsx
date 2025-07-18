"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, ArrowRight } from "lucide-react"

interface DiscordUsernameFormProps {
  onSubmit?: (username: string) => void
}

export default function DiscordUsernameForm({ onSubmit }: DiscordUsernameFormProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateUsername = (username: string): boolean => {
    // Discord username validation
    // Must be 2-32 characters, can contain letters, numbers, underscores, and periods
    // Cannot start or end with period, cannot have consecutive periods
    const discordUsernameRegex = /^(?!.*\.{2})[a-zA-Z0-9._]{2,32}(?<!\.)$/
    return discordUsernameRegex.test(username)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("Please enter your Discord username")
      return
    }

    if (!validateUsername(username)) {
      setError(
        "Please enter a valid Discord username (2-32 characters, letters, numbers, underscores, and periods only)",
      )
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call or processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      // PLAN: Store username in localstorage (go to availability calendar page first) -> if we don't have discord username -> then we redirect to this page
      localStorage.setItem("discordUsername", username)

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(username)
      }

      // Navigate to calendar page
      navigate("/calendar", { state: { discordUsername: username } })
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join the Hangout</h1>
          <p className="text-gray-600">Enter your Discord username to get started</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Discord Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">@</span>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="your_username"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <p className="mt-2 text-xs text-gray-500">Your Discord username (without the # and numbers)</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue to Calendar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
