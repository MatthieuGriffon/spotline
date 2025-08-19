<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/useAuthStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  groupId: string
}>()

const chatStore = useChatStore()
const { messages } = storeToRefs(chatStore)

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const newMessage = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

// ----------------------
// Lifecycle
// ----------------------
onMounted(async () => {
  // Charger l’historique au départ
  await chatStore.loadMessages(props.groupId)

  // Connecter le WebSocket
  chatStore.connect(props.groupId)

  scrollToBottom()
})

onBeforeUnmount(() => {
  // Déconnexion propre quand on quitte
  chatStore.disconnect()
})

// ----------------------
// Watch pour scroll auto
// ----------------------
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// ----------------------
// Envoi message
// ----------------------
async function send() {
  if (!newMessage.value.trim()) return
  chatStore.sendMessageWS(newMessage.value)
  newMessage.value = ''
}
</script>

<template>
  <div class="chat-panel">
    <!-- Header -->
    <header class="chat-header">
      <h2>Chat du groupe</h2>
    </header>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="chat-message"
        :class="{ mine: msg.user.id === user?.id }"
      >
        <!-- Avatar -->
        <div class="chat-avatar">
          <img
            v-if="msg.user.imageUrl"
            :src="`http://localhost:3000${msg.user.imageUrl}`"
            :alt="msg.user.pseudo"
            class="avatar"
          />
          <div v-else class="avatar-fallback">
            {{ msg.user.pseudo.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Contenu -->
        <div class="message-content">
          <div class="message-header">
            <strong>{{ msg.user.pseudo }}</strong>
            <small>
              {{
                new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </small>
          </div>
          <p>{{ msg.content }}</p>
        </div>
      </div>
    </div>

    <!-- Input -->
    <footer class="chat-input">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Écrire un message..."
        @keyup.enter="send"
      />
      <button class="btn-send" @click="send">Envoyer</button>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.chat-message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  max-width: 80%;

  &.mine {
    margin-left: auto; /* pousse à droite */
    flex-direction: row-reverse; /* avatar à droite */
    .message-content {
      background: #007bff;
      color: white;
    }
  }
}

.message-content {
  background: #f2f2f2;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  max-width: 70%;
}

.chat-avatar img,
.chat-avatar .avatar-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
</style>