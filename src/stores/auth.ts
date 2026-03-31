import { defineStore } from "pinia"

import { api } from "@/lib/api"
import { getSupabase } from "@/lib/supabase"
import { userResponseSchema, type UserResponse } from "@/schemas/userResponse"

type RegisterPayload = {
  email: string
  password: string
  firstName?: string
  lastName?: string
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
      } catch {
        // Existing/stale browser session should not crash app bootstrap.
        await supabase.auth.signOut()
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
