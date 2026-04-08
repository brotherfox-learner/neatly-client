import axios from "axios"
import { defineStore } from "pinia"

import { api } from "@/lib/api"
import {
  avatarUploadResponseSchema,
  profileUpdateSchema,
  type ProfileUpdatePayload,
} from "@/schemas/profile"
import { getSupabase } from "@/lib/supabase"
import { userResponseSchema, type UserResponse } from "@/schemas/userResponse"

/** True when Spring `/api/v1/me` rejected the JWT (revoked user, invalid auth). */
export function isMeUnauthorized(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  const status = error.response?.status
  return status === 401 || status === 403
}

type RegisterPayload = {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  country?: string
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as UserResponse | null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => state.user?.role?.toLowerCase() === "admin",
  },
  actions: {
    async initializeFromSession() {
      const supabase = getSupabase()
      if (!supabase) {
        this.user = null
        this.initialized = true
        return
      }

      const { data } = await supabase.auth.getSession()
      if (!data.session?.access_token) {
        this.user = null
        this.initialized = true
        return
      }

      try {
        await this.fetchMe(data.session.access_token)
      } catch (e) {
        // Only drop Supabase session when the backend explicitly rejects the token.
        // Network blips / 5xx / timeouts should not sign the user out of Supabase.
        if (isMeUnauthorized(e)) {
          await supabase.auth.signOut()
        }
        this.user = null
      }
      this.initialized = true
    },
    async fetchMe(accessToken?: string) {
      const { data } = await api.get<unknown>("/api/v1/me", {
        ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
      })
      this.user = userResponseSchema.parse(data)
      return this.user
    },
    async updateMe(payload: ProfileUpdatePayload) {
      const parsed = profileUpdateSchema.parse(payload)
      const { data } = await api.put<unknown>("/api/v1/me", parsed)
      this.user = userResponseSchema.parse(data)
      return this.user
    },
    async uploadProfileAvatar(file: File) {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await api.post<unknown>("/api/v1/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return avatarUploadResponseSchema.parse(data).avatarUrl
    },
    async signIn(email: string, password: string) {
      const supabase = getSupabase()
      if (!supabase) {
        throw new Error("Supabase is not configured.")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      const accessToken = data.session?.access_token
      if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned.")
      }

      await this.fetchMe(accessToken)
      this.initialized = true
    },
    async signUp(payload: RegisterPayload) {
      const supabase = getSupabase()
      if (!supabase) {
        throw new Error("Supabase is not configured.")
      }

      const email = payload.email.trim()
      if (!email) {
        throw new Error("Please enter your email.")
      }

      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/login` : undefined

      const { data, error } = await supabase.auth.signUp({
        email,
        password: payload.password,
        options: {
          ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
          data: {
            first_name: payload.firstName?.trim() || undefined,
            last_name: payload.lastName?.trim() || undefined,
            phone_number: payload.phone?.trim() || undefined,
            birth_date: payload.dateOfBirth?.trim() || undefined,
            country: payload.country?.trim() || undefined,
          },
        },
      })

      if (error) {
        throw new Error(
          error.message || `Sign up failed (${error.status ?? "unknown"}). Check Network → signup → Response for details.`,
        )
      }

      const accessToken = data.session?.access_token
      if (accessToken) {
        try {
          await this.fetchMe(accessToken)
          this.initialized = true
        } catch {
          // Sign-up can still be successful in Supabase even if backend /me is not ready yet.
          // Keep UX successful (user is redirected to login) and let provisioning happen later.
        }
      }
    },
    async signOut() {
      const supabase = getSupabase()
      await supabase?.auth.signOut()
      this.user = null
      this.initialized = true
    },
  },
})
