<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Client } from '@stomp/stompjs'
import axios from 'axios'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import { getApiBaseUrl, getChatWebSocketUrl } from '@/lib/apiBaseUrl'

interface ChatRoom {
  id: string
  userId: string
  userName: string
  userAvatarUrl: string | null
  agentId: string | null
  agentName: string
  agentAvatarUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
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

const pendingRooms = ref<ChatRoom[]>([])
const activeRooms = ref<ChatRoom[]>([])
const selectedRoom = ref<ChatRoom | null>(null)
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const stompClient = ref<Client | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(async () => {
  await fetchPendingRooms()
  await fetchMyActiveRooms()
  await connectWebSocket()
})

onUnmounted(() => {
  if (stompClient.value) {
    stompClient.value.deactivate()
  }
})

async function fetchPendingRooms() {
  try {
    const baseUrl = getApiBaseUrl()
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    if (!token) return

    const res = await axios.get<ChatRoom[]>(`${baseUrl}/api/v1/chat/rooms/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    pendingRooms.value = res.data
  } catch (e) {
    console.error('Failed to fetch pending rooms:', e)
  }
}

async function fetchMyActiveRooms() {
  try {
    const baseUrl = getApiBaseUrl()
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    if (!token) return

    const res = await axios.get<ChatRoom[]>(`${baseUrl}/api/v1/chat/rooms/my-active`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    activeRooms.value = res.data
  } catch (e) {
    console.error('Failed to fetch active rooms:', e)
  }
}

async function connectWebSocket() {
  try {
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    if (!token) return

    const wsUrl = getChatWebSocketUrl()

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // Listen for new requests
        client.subscribe('/topic/admin/chat-requests', (msg) => {
          try {
            const room = JSON.parse(msg.body) as ChatRoom
            if (!pendingRooms.value.find(r => r.id === room.id)) {
              pendingRooms.value.push(room)
            }
          } catch (e) {}
        })

        // Listen for taken requests
        client.subscribe('/topic/admin/chat-taken', (msg) => {
          try {
            const data = JSON.parse(msg.body)
            pendingRooms.value = pendingRooms.value.filter(r => r.id !== data.chatRoomId)
          } catch (e) {}
        })

        // Personal queue for this admin (JWT sub = Principal name)
        client.subscribe('/user/queue/chat', (msg) => {
          try {
            const chatMsg = JSON.parse(msg.body) as ChatMessage
            if (selectedRoom.value?.id === chatMsg.chatRoomId) {
              messages.value.push(chatMsg)
              scrollToBottom()
            }
          } catch (e) {}
        })
      }
    })
    
    client.activate()
    stompClient.value = client
  } catch (e) {
    console.error('Websocket connection failed:', e)
  }
}

async function acceptRoom(roomId: string) {
  try {
    const baseUrl = getApiBaseUrl()
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    
    const res = await axios.post<ChatRoom>(
      `${baseUrl}/api/v1/chat/rooms/${roomId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    // Remove from pending
    pendingRooms.value = pendingRooms.value.filter(r => r.id !== roomId)
    
    // Add to active
    const acceptedRoom = res.data
    activeRooms.value.push(acceptedRoom)
    
    // Auto-select
    selectRoom(acceptedRoom)
  } catch (e: any) {
    if (e.response?.status === 409) {
      alert('This room has already been accepted by another admin.')
      pendingRooms.value = pendingRooms.value.filter(r => r.id !== roomId)
    } else {
      console.error('Failed to accept room:', e)
    }
  }
}

async function selectRoom(room: ChatRoom) {
  selectedRoom.value = room
  try {
    const baseUrl = getApiBaseUrl()
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    
    const res = await axios.get<ChatMessage[]>(`${baseUrl}/api/v1/chat/rooms/${room.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    messages.value = res.data
    scrollToBottom()
  } catch (e) {
    console.error('Failed to fetch messages:', e)
  }
}

async function sendMessage() {
  const text = inputMessage.value.trim()
  if (!text || !selectedRoom.value) return
  
  try {
    const baseUrl = getApiBaseUrl()
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    
    await axios.post(
      `${baseUrl}/api/v1/chat/rooms/${selectedRoom.value.id}/messages`,
      { message: text },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    inputMessage.value = ''
  } catch (e) {
    console.error('Failed to send message:', e)
  }
}

async function leaveChat() {
  if (!selectedRoom.value) return
  try {
    const baseUrl = getApiBaseUrl()
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()
    const session = await supabase?.auth.getSession()
    const token = session?.data?.session?.access_token
    
    await axios.post(
      `${baseUrl}/api/v1/chat/rooms/${selectedRoom.value.id}/leave`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    activeRooms.value = activeRooms.value.filter(r => r.id !== selectedRoom.value!.id)
    selectedRoom.value = null
    messages.value = []
  } catch (e) {
    console.error('Failed to leave chat:', e)
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <AdminPageHeader title="Live Chat Responses" />
    
    <div class="flex flex-1 overflow-hidden p-6 gap-6">
      <!-- Left Sidebar (Room Lists) -->
      <div class="w-1/4 min-w-[300px] flex flex-col gap-6 h-full">
        <!-- Pending Requests -->
        <div class="flex flex-col bg-white border border-[#E4E6ED] rounded-xl overflow-hidden flex-1 max-h-[50%]">
          <div class="bg-[#2F3E35] text-white px-4 py-3 font-medium flex justify-between items-center">
            <span>Pending Requests</span>
            <span class="bg-[#c4956a] px-2 py-0.5 rounded-full text-xs">{{ pendingRooms.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto w-full p-2">
            <div v-if="pendingRooms.length === 0" class="text-center text-[#94a3b8] py-8 text-sm">
              No pending chat requests.
            </div>
            <div 
              v-else
              v-for="room in pendingRooms" 
              :key="room.id"
              class="p-3 border border-[#E4E6ED] rounded-lg mb-2 flex justify-between items-center hover:bg-[#f8f9fa] w-full gap-2"
            >
              <div class="flex items-center gap-3 overflow-hidden flex-1">
                 <img v-if="room.userAvatarUrl" :src="room.userAvatarUrl" class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                 <div v-else class="w-10 h-10 rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold flex-shrink-0">{{ room.userName?.[0]?.toUpperCase() ?? 'U' }}</div>
                <div class="overflow-hidden">
                  <p class="text-sm font-medium text-[#2f3e35] truncate">{{ room.userName || 'User' }}</p>
                  <p class="text-[10px] text-[#64748b] truncate">Req: {{ room.id.substring(0, 8) }}</p>
                </div>
              </div>
              <button 
                class="bg-[#81A08F] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#5d7b6a] transition flex-shrink-0"
                @click="acceptRoom(room.id)"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
        
        <!-- Active Chats -->
        <div class="flex flex-col bg-white border border-[#E4E6ED] rounded-xl overflow-hidden flex-1 max-h-[50%]">
          <div class="bg-[#5d7b6a] text-white px-4 py-3 font-medium">
            My Active Chats
          </div>
          <div class="flex-1 overflow-y-auto p-2">
             <div v-if="activeRooms.length === 0" class="text-center text-[#94a3b8] py-8 text-sm">
              You have no active chats.
            </div>
            <div 
              v-else
              v-for="room in activeRooms" 
              :key="room.id"
              class="p-3 border border-[#E4E6ED] rounded-lg mb-2 cursor-pointer transition flex items-center gap-3 w-full"
              :class="selectedRoom?.id === room.id ? 'border-[#81A08F] bg-[#f1f5f9]' : 'hover:bg-[#f8f9fa]'"
              @click="selectRoom(room)"
            >
              <img v-if="room.userAvatarUrl" :src="room.userAvatarUrl" class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div v-else class="w-10 h-10 rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold flex-shrink-0">{{ room.userName?.[0]?.toUpperCase() ?? 'U' }}</div>
              
              <div class="overflow-hidden">
                <p class="text-sm font-medium text-[#2f3e35] truncate">{{ room.userName || 'User' }}</p>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <p class="text-xs text-[#64748b]">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Pane (Chat Window) -->
      <div class="flex-1 bg-white border border-[#E4E6ED] rounded-xl overflow-hidden flex flex-col">
        <template v-if="selectedRoom">
          <div class="px-6 py-4 border-b border-[#E4E6ED] flex justify-between items-center bg-[#fdf8f4]">
            <div class="flex items-center gap-3">
               <img v-if="selectedRoom.userAvatarUrl" :src="selectedRoom.userAvatarUrl" class="w-10 h-10 rounded-full object-cover" />
               <div v-else class="w-10 h-10 rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold">{{ selectedRoom.userName?.[0]?.toUpperCase() ?? 'U' }}</div>
               <div>
                  <h3 class="font-semibold text-[#2f3e35] leading-tight">{{ selectedRoom.userName || 'User' }}</h3>
                  <p class="text-xs text-[#64748b]">Customer</p>
               </div>
            </div>
            <button 
               type="button"
               class="text-[#64748b] text-sm font-medium hover:underline hover:text-[#c04e1d] flex items-center gap-1"
               @click="leaveChat"
            >
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               Leave chat
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#f8f9fa]" ref="messagesContainer">
            <div 
              v-for="msg in messages" 
              :key="msg.id"
              class="flex flex-col w-full"
            >
              <div v-if="msg.senderType === 'SYSTEM'" class="text-xs text-center text-[#64748b] bg-[#e2e8f0] self-center px-4 py-1.5 rounded-full my-2">
                {{ msg.message }}
              </div>
              
              <div 
                v-else
                class="flex gap-3 w-full max-w-[85%]"
                :class="msg.senderType === 'AGENT' ? 'self-end flex-row-reverse' : 'self-start'"
              >
                <!-- Avatar -->
                <div class="flex-shrink-0 mt-auto">
                    <img v-if="msg.senderAvatarUrl" :src="msg.senderAvatarUrl" class="w-8 h-8 rounded-full object-cover"/>
                    <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                         :class="msg.senderType === 'AGENT' ? 'bg-[#c4956a]' : 'bg-[#cbd5e1]'">
                         {{ msg.senderName?.[0]?.toUpperCase() ?? (msg.senderType === 'AGENT' ? 'A' : 'U') }}
                    </div>
                </div>
                
                <!-- Bubble -->
                <div class="flex flex-col" :class="msg.senderType === 'AGENT' ? 'items-end' : 'items-start'">
                    <span class="text-[11px] text-[#64748b] mb-1 mx-1">{{ msg.senderName || (msg.senderType === 'AGENT' ? 'You' : 'User') }}</span>
                    <div 
                      class="px-4 py-3 text-sm flex flex-col"
                      :class="[
                        msg.senderType === 'AGENT' 
                          ? 'bg-[#5d7b6a] text-white rounded-t-2xl rounded-bl-2xl' 
                          : 'bg-white border border-[#cbd5e1] text-[#2f3e35] rounded-t-2xl rounded-br-2xl'
                      ]"
                    >
                      <span class="whitespace-pre-wrap">{{ msg.message }}</span>
                    </div>
                    <span class="text-[10px] text-[#94a3b8] mt-1 mx-1">{{ formatDate(msg.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-white border-t border-[#E4E6ED]">
            <form @submit.prevent="sendMessage" class="flex gap-3">
              <input 
                v-model="inputMessage"
                type="text" 
                class="flex-1 border border-[#E4E6ED] rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-[#81A08F]"
                placeholder="Type your message..."
              />
              <button 
                type="submit"
                class="bg-[#c4956a] hover:bg-[#b3865d] text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
                :disabled="!inputMessage.trim()"
              >
                <span>Send</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        </template>
        
        <div v-else class="flex-1 flex flex-col items-center justify-center text-[#64748b]">
          <div class="bg-[#f1f5f9] p-6 rounded-full mb-4">
             <svg class="w-12 h-12 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
             </svg>
          </div>
          <p class="font-medium text-[#2f3e35]">No Conversation Selected</p>
          <p class="text-sm mt-1">Select a request or an active chat from the left panel.</p>
        </div>
      </div>
    </div>
  </div>
</template>
