import { ref, onUnmounted, watch } from 'vue'
import { Client } from '@stomp/stompjs'
import { useChatStore } from '@/stores/chat'
import { getChatWebSocketUrl } from '@/lib/apiBaseUrl'

export function useChatWebSocket() {
  const store = useChatStore()
  const stompClient = ref<Client | null>(null)
  const connected = ref(false)
  let connectSeq = 0

  async function disconnect() {
    const c = stompClient.value
    stompClient.value = null
    connected.value = false
    if (c) {
      try {
        await c.deactivate()
      } catch {
        /* ignore */
      }
    }
  }

  async function connect() {
    const mode = store.mode
    if (mode !== 'waiting_agent' && mode !== 'live_chat') return

    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    if (!token) return

    const seq = ++connectSeq
    await disconnect()

    if (seq !== connectSeq) return

    try {
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
          if (seq !== connectSeq) return
          connected.value = true

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

      stompClient.value = client
      client.activate()
    } catch (e) {
      console.error('WebSocket connection failed:', e)
    }
  }

  /** One "bucket" for waiting + live so agent join (mode change) does not reconnect STOMP. */
  const liveSocketKey = () =>
    store.mode === 'waiting_agent' || store.mode === 'live_chat' ? 'on' : 'off'

  watch(
    () => [liveSocketKey(), store.isLoggedInForChat] as const,
    ([socketOn, loggedIn], prev) => {
      if (socketOn === 'off' || !loggedIn) {
        connectSeq += 1
        void disconnect()
        return
      }
      const wasOff = !prev || prev[0] === 'off' || prev[1] === false
      if (wasOff || !stompClient.value?.connected) {
        connectSeq += 1
        void connect()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    connectSeq += 1
    void disconnect()
  })

  return {
    connected,
    connect,
    disconnect,
  }
}
