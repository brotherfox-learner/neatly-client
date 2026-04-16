const STORAGE_KEY = 'neatly.chat.client.v1'

/** User chat panel: restore after refresh until idle timeout. */
export const CHAT_CLIENT_SESSION_TTL_MS = 15 * 60 * 1000

export type PersistedClientChatV1 = {
  v: 1
  lastActivityAt: number
  messages: unknown[]
  chatRoomId: string | null
  mode: string
  presetQuestions: unknown[]
}

export function readPersistedClientChat(): PersistedClientChatV1 | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedClientChatV1>
    if (parsed.v !== 1 || typeof parsed.lastActivityAt !== 'number') return null
    if (Date.now() - parsed.lastActivityAt > CHAT_CLIENT_SESSION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    const mode =
      parsed.mode === 'waiting_agent' || parsed.mode === 'live_chat' || parsed.mode === 'bot' ? parsed.mode : 'bot'
    return {
      v: 1,
      lastActivityAt: parsed.lastActivityAt,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      chatRoomId: parsed.chatRoomId ?? null,
      mode,
      presetQuestions: Array.isArray(parsed.presetQuestions) ? parsed.presetQuestions : [],
    }
  } catch {
    return null
  }
}

export function writePersistedClientChat(
  state: {
    lastActivityAt?: number
    messages: unknown[]
    chatRoomId: string | null
    mode: string
    presetQuestions: unknown[]
  },
) {
  try {
    const payload: PersistedClientChatV1 = {
      v: 1,
      lastActivityAt: state.lastActivityAt ?? Date.now(),
      messages: state.messages,
      chatRoomId: state.chatRoomId,
      mode: state.mode,
      presetQuestions: state.presetQuestions,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function clearPersistedClientChat() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
