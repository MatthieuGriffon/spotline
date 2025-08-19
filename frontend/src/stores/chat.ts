import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BASE_API_URL } from '@/api/config'

export interface ChatUser {
  id: string
  pseudo: string
  imageUrl?: string
}

export interface ChatMessage {
  id: string
  content: string
  createdAt: string
  user: ChatUser
  referenceType: string | null
  referenceId: string | null
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const socket = ref<WebSocket | null>(null)

  // ------------------------------
  // Charger historique d’un groupe
  // ------------------------------
  async function loadMessages(groupId: string, limit = 50, offset = 0) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(
        `${BASE_API_URL}/groupes/${groupId}/messages?limit=${limit}&offset=${offset}`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Impossible de charger les messages')
      const data: { messages: ChatMessage[] } = await res.json()
      messages.value = data.messages
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue'
    } finally {
      isLoading.value = false
    }
  }

  // ------------------------------
  // Connexion WebSocket
  // ------------------------------
  function connect(groupId: string) {
    if (socket.value) socket.value.close()

    // Construire la bonne URL une seule fois
    const wsUrl = BASE_API_URL.replace(/^http/, 'ws') + `/groupes/${groupId}/chat`
    console.log('[WS] Tentative de connexion à :', wsUrl)

    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('[WS] Connecté au serveur')
    }

   socket.value.onmessage = (event) => {
     console.log('📥 Message brut reçu :', event.data)
     try {
       const msg = JSON.parse(event.data)

       console.log('📥 Après parse :', msg)

       // NE PAS refaire JSON.parse(msg.content)
       messages.value.push(msg as ChatMessage)
     } catch (err) {
       console.error('[WS] Erreur parsing message', err, event.data)
     }
   }

    socket.value.onerror = (err) => {
      console.error('[WS] Erreur WebSocket', err)
    }

    socket.value.onclose = () => {
      console.log('[WS] Déconnecté du serveur')
      socket.value = null
    }
  }

  // ------------------------------
  // Déconnexion
  // ------------------------------
  function disconnect() {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
  }

  // ------------------------------
  // Envoi message via WebSocket
  // ------------------------------
  function sendMessageWS(
    content: string,
    referenceType: string | null = null,
    referenceId: string | null = null,
  ) {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Impossible d’envoyer, socket fermée')
      return
    }

    socket.value.send(
      JSON.stringify({
        content,
        referenceType,
        referenceId,
      }),
    )
  }

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    connect,
    disconnect,
    sendMessageWS,
  }
})
