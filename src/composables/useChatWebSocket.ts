import { ref, onUnmounted, watch } from 'vue'
import { Client } from '@stomp/stompjs'
import { useChatStore } from '@/stores/chat'
import { getChatWebSocketUrl } from '@/lib/apiBaseUrl'

export function useChatWebSocket() {
  const store = useChatStore()
  const stompClient = ref<Client | null>(null)
  const connected = ref(false)

  async function connect() {
    if (stompClient.value?.connected) return

    try {
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      const session = await supabase?.auth.getSession()
      const token = session?.data?.session?.access_token
      if (!token) return

      const wsUrl = getChatWebSocketUrl()

      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          connected.value = true

          // Spring maps /user/queue/* to the authenticated Principal (JWT sub)
          client.subscribe('/user/queue/chat', (message) => {
            try {
              const data = JSON.parse(message.body) as {
                id?: string
                senderType?: string
                message?: string
                senderName?: string
                senderAvatarUrl?: string
              }
              if (data.senderType === 'SYSTEM' && data.message != null) {
                store.onIncomingLiveSystemMessage({ id: data.id, message: data.message })
                return
              }
              if (data.senderType && data.senderType !== 'SYSTEM' && data.message != null) {
                store.onIncomingMessage({
                  id: data.id,
                  message: data.message,
                  senderType: data.senderType,
                  senderName: data.senderName,
                  senderAvatarUrl: data.senderAvatarUrl,
                })
              }
            } catch {
              // ignore parse errors
            }
          })

          client.subscribe('/user/queue/chat-events', (message) => {
            try {
              const data = JSON.parse(message.body)
              if (data.event === 'AGENT_JOINED') {
                store.onAgentJoined(data.agentName || 'Admin')
              } else if (data.event === 'AGENT_LEFT') {
                store.onAgentLeft()
              } else if (data.event === 'CHAT_CLOSED') {
                store.onChatClosed()
              }
            } catch {
              // ignore parse errors
            }
          })
        },
        onDisconnect: () => {
          connected.value = false
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message'])
          connected.value = false
        },
      })

      client.activate()
      stompClient.value = client
    } catch (e) {
      console.error('WebSocket connection failed:', e)
    }
  }

  function disconnect() {
    if (stompClient.value) {
      stompClient.value.deactivate()
      stompClient.value = null
      connected.value = false
    }
  }

  watch(
    () => store.mode,
    (newMode) => {
      if (newMode === 'waiting_agent' || newMode === 'live_chat') {
        void connect()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    connect,
    disconnect,
  }
}
