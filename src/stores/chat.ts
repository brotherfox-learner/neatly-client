import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { getApiBaseUrl } from '@/lib/apiBaseUrl'
import {
  readPersistedClientChat,
  writePersistedClientChat,
  clearPersistedClientChat,
} from '@/lib/chatSessionStorage'

export interface PresetQuestion {
  id: string
  question: string
  responseType: string
}

export interface RoomCard {
  id: string
  name: string
  basePrice: number
  discountedPrice: number | null
  imageUrl: string | null
  description?: string | null
}

export interface PaymentOption {
  label: string
  key: string
  detail: string
}

export interface PromotionCard {
  id: string
  code: string
  discountType: string
  discountValue: number
  maxDiscount: number | null
  minSpend: number
  startDate: string | null
  endDate: string | null
}

export interface PresetAnswer {
  answer: string
  responseType: string
  cards: RoomCard[] | PromotionCard[] | null
  options: PaymentOption[] | null
}

export interface ChatMsg {
  id: string
  type:
    | 'bot-text'
    | 'bot-cards'
    | 'bot-options'
    | 'bot-payment-panel'
    | 'bot-promotions'
    | 'user'
    | 'system'
    | 'preset-buttons'
    | 'agent-text'
  text?: string
  senderName?: string
  senderAvatarUrl?: string
  cards?: RoomCard[]
  promotionCards?: PromotionCard[]
  options?: PaymentOption[]
  action?: string // 'view_detail' or 'book_now' for room cards
  timestamp: number
}

export type ChatMode = 'bot' | 'waiting_agent' | 'live_chat'

interface SessionRoomDto {
  id: string
  userId: string
  status: string
  userName: string
  userAvatarUrl: string | null
  agentId: string | null
  agentName: string
  agentAvatarUrl: string | null
  createdAt: string
  updatedAt: string
}

interface ApiChatMessage {
  id: string
  chatRoomId: string
  senderId: string | null
  senderName: string
  senderAvatarUrl: string | null
  senderType: string
  message: string
  messageType: string
  createdAt: string
}

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const messages = ref<ChatMsg[]>([])
  const chatRoomId = ref<string | null>(null)
  const mode = ref<ChatMode>('bot')
  const presetQuestions = ref<PresetQuestion[]>([])
  const isTyping = ref(false)
  const isLoadingPresets = ref(false)
  const isRestoring = ref(false)

  const hasMessages = computed(() => messages.value.length > 0)

  function roomStatusToMode(status: string): ChatMode {
    if (status === 'WAITING_AGENT') return 'waiting_agent'
    if (status === 'ACTIVE') return 'live_chat'
    return 'bot'
  }

  function mapApiMessageToChatMsg(row: ApiChatMessage): ChatMsg {
    const ts = new Date(row.createdAt).getTime()
    const base = { id: row.id, timestamp: ts }
    if (row.senderType === 'SYSTEM') {
      return { ...base, type: 'system', text: row.message }
    }
    if (row.senderType === 'AGENT') {
      return {
        ...base,
        type: 'agent-text',
        text: row.message,
        senderName: row.senderName,
        senderAvatarUrl: row.senderAvatarUrl ?? undefined,
      }
    }
    if (row.senderType === 'USER') {
      return { ...base, type: 'user', text: row.message }
    }
    return { ...base, type: 'bot-text', text: row.message }
  }

  async function tryRestoreFromBrowserSession() {
    isRestoring.value = true
    try {
      const persisted = readPersistedClientChat()
      if (persisted) {
        messages.value = persisted.messages as ChatMsg[]
        chatRoomId.value = persisted.chatRoomId
        mode.value = persisted.mode as ChatMode
        if (persisted.presetQuestions.length > 0) {
          presetQuestions.value = persisted.presetQuestions as PresetQuestion[]
        }
      }

      const baseUrl = getApiBaseUrl()
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      const session = await supabase?.auth.getSession()
      const token = session?.data?.session?.access_token

      if (!token) {
        if (messages.value.length === 0) {
          addGreeting()
          void loadPresets()
        } else if (mode.value === 'bot' && presetQuestions.value.length > 0) {
          addPresetButtons()
        }
        return
      }

      const sessionRes = await axios.get<SessionRoomDto>(`${baseUrl}/api/v1/chat/rooms/session`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (s) => s === 200 || s === 204,
      })

      if (sessionRes.status === 204) {
        chatRoomId.value = null
        if (mode.value === 'waiting_agent' || mode.value === 'live_chat') {
          mode.value = 'bot'
          messages.value = []
          addGreeting()
        }
        if (messages.value.length === 0) {
          addGreeting()
        }
        if (presetQuestions.value.length === 0) await loadPresets()
        else if (mode.value === 'bot') addPresetButtons()
        return
      }

      const room = sessionRes.data
      chatRoomId.value = room.id
      const nextMode = roomStatusToMode(room.status)
      mode.value = nextMode

      const hist = await axios.get<ApiChatMessage[]>(`${baseUrl}/api/v1/chat/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const mapped = hist.data.map(mapApiMessageToChatMsg)
      if (mapped.length > 0) {
        messages.value = mapped
      } else if (messages.value.length === 0) {
        addGreeting()
      }

      if (nextMode === 'bot') {
        if (presetQuestions.value.length === 0) await loadPresets()
        else addPresetButtons()
      }
    } catch (e) {
      console.error('Chat session restore failed:', e)
      if (messages.value.length === 0) {
        addGreeting()
        void loadPresets()
      }
    } finally {
      isRestoring.value = false
    }
  }

  function resetForLogout() {
    clearPersistedClientChat()
    isOpen.value = false
    messages.value = []
    chatRoomId.value = null
    mode.value = 'bot'
    presetQuestions.value = []
    isTyping.value = false
    isLoadingPresets.value = false
  }

  async function startNewChat() {
    isRestoring.value = true
    try {
      clearPersistedClientChat()
      const baseUrl = getApiBaseUrl()
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      const session = await supabase?.auth.getSession()
      const token = session?.data?.session?.access_token
      const id = chatRoomId.value
      if (token && id) {
        try {
          await axios.post(
            `${baseUrl}/api/v1/chat/rooms/${id}/close`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          )
        } catch {
          /* ignore */
        }
      }
      chatRoomId.value = null
      mode.value = 'bot'
      messages.value = []
      presetQuestions.value = []
      addGreeting()
      await loadPresets()
    } finally {
      isRestoring.value = false
    }
  }

  function toggleChat() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      if (messages.value.length === 0 && !isRestoring.value) {
        addGreeting()
        void loadPresets()
      }
      if (!isRestoring.value) {
        writePersistedClientChat({
          messages: messages.value,
          chatRoomId: chatRoomId.value,
          mode: mode.value,
          presetQuestions: presetQuestions.value,
        })
      }
    }
  }

  function addGreeting() {
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'bot-text',
      text: "Welcome to Neatly Hotel! 🌟 I'm your virtual assistant. Choose a topic you'd like to know more about. I'm here to help! 😊",
      timestamp: Date.now(),
    })
  }

  async function loadPresets() {
    if (presetQuestions.value.length > 0) {
      addPresetButtons()
      return
    }
    isLoadingPresets.value = true
    try {
      const baseUrl = getApiBaseUrl()
      const res = await axios.get<PresetQuestion[]>(`${baseUrl}/api/v1/chat/presets`)
      presetQuestions.value = res.data
      addPresetButtons()
    } catch (e) {
      console.error('Failed to load presets:', e)
      // Fallback presets
      presetQuestions.value = [
        { id: 'fallback-1', question: 'Room Types', responseType: 'room_cards' },
        { id: 'fallback-2', question: 'Booking', responseType: 'room_cards' },
        { id: 'fallback-3', question: 'Check-in & Check-out Time', responseType: 'text' },
        { id: 'fallback-4', question: 'Payment Methods', responseType: 'options' },
        { id: 'fallback-5', question: 'Promotion', responseType: 'promotion_cards' },
      ]
      addPresetButtons()
    } finally {
      isLoadingPresets.value = false
    }
  }

  function addPresetButtons() {
    // Remove any existing preset-buttons message
    messages.value = messages.value.filter((m) => m.type !== 'preset-buttons')
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'preset-buttons',
      timestamp: Date.now(),
    })
  }

  async function handlePresetClick(preset: PresetQuestion) {
    // Add user message bubble
    messages.value = messages.value.filter((m) => m.type !== 'preset-buttons')
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'user',
      text: preset.question,
      timestamp: Date.now(),
    })

    // Show typing indicator
    isTyping.value = true

    try {
      const baseUrl = getApiBaseUrl()

      // For fallback presets, use hardcoded responses
      if (preset.id.startsWith('fallback-')) {
        await simulateDelay(800)
        handleFallbackPreset(preset)
        return
      }

      const res = await axios.get<PresetAnswer>(`${baseUrl}/api/v1/chat/presets/${preset.id}/answer`)
      await simulateDelay(500) // Small delay for natural feel

      const data = res.data

      switch (data.responseType) {
        case 'room_cards':
          messages.value.push({
            id: crypto.randomUUID(),
            type: 'bot-text',
            text: data.answer,
            timestamp: Date.now(),
          })
          if (data.cards && data.cards.length > 0) {
            messages.value.push({
              id: crypto.randomUUID(),
              type: 'bot-cards',
              cards: data.cards as RoomCard[],
              action: preset.question === 'Booking' ? 'book_now' : 'view_detail',
              timestamp: Date.now(),
            })
          }
          break

        case 'options':
          if (data.options && data.options.length > 0) {
            const intro =
              data.answer?.trim() ||
              'Here are the payment methods we accept. Tap to see more details 💳💵'
            messages.value.push({
              id: crypto.randomUUID(),
              type: 'bot-payment-panel',
              text: intro,
              options: data.options as PaymentOption[],
              timestamp: Date.now(),
            })
          } else {
            messages.value.push({
              id: crypto.randomUUID(),
              type: 'bot-text',
              text: data.answer,
              timestamp: Date.now(),
            })
          }
          break

        case 'promotion_cards':
          messages.value.push({
            id: crypto.randomUUID(),
            type: 'bot-text',
            text: data.answer,
            timestamp: Date.now(),
          })
          if (data.cards && data.cards.length > 0) {
            messages.value.push({
              id: crypto.randomUUID(),
              type: 'bot-promotions',
              promotionCards: data.cards as PromotionCard[],
              timestamp: Date.now(),
            })
          }
          break

        default:
          messages.value.push({
            id: crypto.randomUUID(),
            type: 'bot-text',
            text: data.answer,
            timestamp: Date.now(),
          })
      }
    } catch (e) {
      console.error('Failed to get preset answer:', e)
      messages.value.push({
        id: crypto.randomUUID(),
        type: 'bot-text',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      })
    } finally {
      isTyping.value = false
      addPresetButtons()
    }
  }

  function handleFallbackPreset(preset: PresetQuestion) {
    switch (preset.responseType) {
      case 'text':
        messages.value.push({
          id: crypto.randomUUID(),
          type: 'bot-text',
          text: "Great! 😊 Here are our check-in and check-out times:\n\nCheck-in time: From 2:00 PM onwards 🕑\nCheck-out time: By 12:00 PM 🕛",
          timestamp: Date.now(),
        })
        break
      case 'options':
        messages.value.push({
          id: crypto.randomUUID(),
          type: 'bot-payment-panel',
          text: 'Here are the payment methods we accept. Tap to see more details 💳💵',
          options: [
            {
              label: 'credit card',
              key: 'credit_card',
              detail: 'We accept major credit cards including Visa and MasterCard.',
            },
            {
              label: 'Cash',
              key: 'cash',
              detail:
                'You may settle payment in cash or by cheque at the hotel. No payment is required until check-in.',
            },
          ],
          timestamp: Date.now(),
        })
        break
      default:
        messages.value.push({
          id: crypto.randomUUID(),
          type: 'bot-text',
          text: 'This feature is coming soon!',
          timestamp: Date.now(),
        })
    }
    isTyping.value = false
    addPresetButtons()
  }

  async function handleFreeText(text: string) {
    // Remove preset buttons
    messages.value = messages.value.filter((m) => m.type !== 'preset-buttons')

    // Add user message
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'user',
      text,
      timestamp: Date.now(),
    })

    isTyping.value = true

    try {
      const baseUrl = getApiBaseUrl()
      const res = await axios.get<PresetAnswer>(`${baseUrl}/api/v1/chat/search`, {
        params: { q: text },
      })
      
      await simulateDelay(500)
      
      if (res.status === 200 && res.data) {
        const data = res.data
        switch (data.responseType) {
          case 'room_cards':
            messages.value.push({ id: crypto.randomUUID(), type: 'bot-text', text: data.answer, timestamp: Date.now() })
            if (data.cards?.length) {
              messages.value.push({
                id: crypto.randomUUID(),
                type: 'bot-cards',
                cards: data.cards as RoomCard[],
                action: text.toLowerCase().includes('book') ? 'book_now' : 'view_detail',
                timestamp: Date.now(),
              })
            }
            break
          case 'options':
            if (data.options && data.options.length > 0) {
              const intro =
                data.answer?.trim() ||
                'Here are the payment methods we accept. Tap to see more details 💳💵'
              messages.value.push({
                id: crypto.randomUUID(),
                type: 'bot-payment-panel',
                text: intro,
                options: data.options as PaymentOption[],
                timestamp: Date.now(),
              })
            } else {
              messages.value.push({ id: crypto.randomUUID(), type: 'bot-text', text: data.answer, timestamp: Date.now() })
            }
            break
          case 'promotion_cards':
            messages.value.push({ id: crypto.randomUUID(), type: 'bot-text', text: data.answer, timestamp: Date.now() })
            if (data.cards?.length) {
              messages.value.push({ id: crypto.randomUUID(), type: 'bot-promotions', promotionCards: data.cards as PromotionCard[], timestamp: Date.now() })
            }
            break
          default:
            messages.value.push({ id: crypto.randomUUID(), type: 'bot-text', text: data.answer, timestamp: Date.now() })
        }
      } else {
        pushFallbackMessage()
      }
    } catch (e) {
      console.error('Search FAQ error:', e)
      pushFallbackMessage()
    } finally {
      isTyping.value = false
      addPresetButtons()
    }
  }

  function pushFallbackMessage() {
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'bot-text',
      text: "I was not able to find a precise answer to that. If you would like to speak with a member of our guest services team, please use the option below.",
      timestamp: Date.now(),
    })
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'bot-options',
      options: [{ label: 'Contact guest services', key: 'contact_admin', detail: '' }],
      timestamp: Date.now(),
    })
  }

  function handleOptionClick(option: PaymentOption) {
    if (option.key === 'contact_admin') {
      void requestLiveAgent()
      return
    }

    // Add user click bubble
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'user',
      text: option.label,
      timestamp: Date.now(),
    })

    // Bot response
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
      messages.value.push({
        id: crypto.randomUUID(),
        type: 'bot-text',
        text: option.detail,
        timestamp: Date.now(),
      })
      addPresetButtons()
    }, 500)
  }

  async function requestLiveAgent() {
    mode.value = 'waiting_agent'
    messages.value.push({
      id: crypto.randomUUID(),
      type: 'system',
      text: 'Connecting you to our team...',
      timestamp: Date.now(),
    })

    try {
      const baseUrl = getApiBaseUrl()

      // Create chat room if not exists
      if (!chatRoomId.value) {
        const { getSupabase } = await import('@/lib/supabase')
        const supabase = getSupabase()
        const session = await supabase?.auth.getSession()
        const token = session?.data?.session?.access_token
        if (!token) {
          messages.value.push({
            id: crypto.randomUUID(),
            type: 'bot-text',
            text: 'Please login first to contact our admin.',
            timestamp: Date.now(),
          })
          mode.value = 'bot'
          return
        }

        const roomRes = await axios.post(
          `${baseUrl}/api/v1/chat/rooms`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
        chatRoomId.value = roomRes.data.id
      }

      // Request agent
      const { getSupabase: getSb } = await import('@/lib/supabase')
      const sb = getSb()
      const sess = await sb?.auth.getSession()
      const tk = sess?.data?.session?.access_token
      if (tk && chatRoomId.value) {
        await axios.post(
          `${baseUrl}/api/v1/chat/rooms/${chatRoomId.value}/request-agent`,
          {},
          { headers: { Authorization: `Bearer ${tk}` } },
        )
      }
    } catch (e) {
      console.error('Failed to request agent:', e)
      messages.value.push({
        id: crypto.randomUUID(),
        type: 'bot-text',
        text: 'Failed to connect. Please try calling us at 029872345.',
        timestamp: Date.now(),
      })
      mode.value = 'bot'
    }
  }

  async function sendLiveMessage(text: string) {
    if (!chatRoomId.value || (mode.value !== 'live_chat' && mode.value !== 'waiting_agent')) return

    messages.value.push({
      id: crypto.randomUUID(),
      type: 'user',
      text,
      timestamp: Date.now(),
    })

    try {
      const baseUrl = getApiBaseUrl()
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      const session = await supabase?.auth.getSession()
      const token = session?.data?.session?.access_token

      if (token) {
        await axios.post(
          `${baseUrl}/api/v1/chat/rooms/${chatRoomId.value}/messages`,
          { message: text },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      }
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }

  function onAgentJoined(_agentName: string) {
    mode.value = 'live_chat'
  }

  function onIncomingLiveSystemMessage(msg: { id?: string; message: string }) {
    messages.value.push({
      id: msg.id ?? crypto.randomUUID(),
      type: 'system',
      text: msg.message,
      timestamp: Date.now(),
    })
  }

  function onAgentLeft() {
    mode.value = 'bot'
    addPresetButtons()
  }

  function onIncomingMessage(msg: {
    id?: string
    message: string
    senderType: string
    senderName?: string
    senderAvatarUrl?: string
  }) {
    if (msg.senderType === 'AGENT') {
      if (mode.value === 'waiting_agent') {
        mode.value = 'live_chat'
      }
      messages.value.push({
        id: msg.id ?? crypto.randomUUID(),
        type: 'agent-text',
        text: msg.message,
        senderName: msg.senderName,
        senderAvatarUrl: msg.senderAvatarUrl,
        timestamp: Date.now(),
      })
    }
  }

  function onChatClosed() {
    clearPersistedClientChat()
    mode.value = 'bot'
    chatRoomId.value = null
    messages.value = [
      {
        id: crypto.randomUUID(),
        type: 'system',
        text: 'Chat has been closed.',
        timestamp: Date.now(),
      },
    ]
    void loadPresets()
  }

  function simulateDelay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  watch(
    [messages, mode, chatRoomId, presetQuestions],
    () => {
      if (isRestoring.value) return
      writePersistedClientChat({
        messages: messages.value,
        chatRoomId: chatRoomId.value,
        mode: mode.value,
        presetQuestions: presetQuestions.value,
      })
    },
    { deep: true },
  )

  return {
    isOpen,
    messages,
    chatRoomId,
    mode,
    presetQuestions,
    isTyping,
    isLoadingPresets,
    hasMessages,
    toggleChat,
    loadPresets,
    handlePresetClick,
    handleFreeText,
    handleOptionClick,
    requestLiveAgent,
    sendLiveMessage,
    onAgentJoined,
    onIncomingLiveSystemMessage,
    onAgentLeft,
    onIncomingMessage,
    onChatClosed,
    tryRestoreFromBrowserSession,
    startNewChat,
    isRestoring,
    resetForLogout,
  }
})
