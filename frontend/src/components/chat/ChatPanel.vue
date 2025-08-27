<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/useAuthStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{ groupId: string }>()

const chatStore = useChatStore()
const { messages } = storeToRefs(chatStore)

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const newMessage = ref('')

// ✅ nouveau: refs stables
const messagesContainer = ref<HTMLDivElement | null>(null)
const bottomSentinel = ref<HTMLDivElement | null>(null)

let resizeObserver: ResizeObserver | null = null

function scrollToBottom(immediate = false) {
  const container = messagesContainer.value
  if (container) {
    // méthode la plus fiable et instantanée
    container.scrollTop = container.scrollHeight
    return
  }
  // fallback via le sentinel si besoin
  bottomSentinel.value?.scrollIntoView({
    behavior: immediate ? 'auto' : 'smooth',
    block: 'end'
  })
}

// ----------------------
// Lifecycle
// ----------------------
onMounted(async () => {
  await chatStore.loadMessages(props.groupId)
  chatStore.connect(props.groupId)

  await nextTick()
  scrollToBottom(true) // pas d’anim au premier rendu

  // 🔹 Observer la zone scrollable pour rester en bas si sa taille change
  resizeObserver = new ResizeObserver(() => scrollToBottom(true))
  if (messagesContainer.value) {
    resizeObserver.observe(messagesContainer.value)
  }
})

onBeforeUnmount(() => {
  chatStore.disconnect()
  if (resizeObserver && messagesContainer.value) {
    resizeObserver.unobserve(messagesContainer.value)
  }
  resizeObserver = null
})

// ----------------------
// Auto-scroll quand un nouveau message arrive
// (on observe la longueur pour éviter deep watch inutile)
// ----------------------
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

// ----------------------
// Envoi message
// ----------------------
async function send() {
  const content = newMessage.value.trim()
  if (!content) return
  chatStore.sendMessageWS(content)
  newMessage.value = ''
  // le watch ci-dessus fera le scroll quand le store ajoutera le message
}
</script>

<template>
<div class="chat-panel">
  <header class="chat-header">
    <h2>Chat du groupe</h2>
  </header>

  <!-- ✅ ref sur le conteneur scrollable -->
  <div class="chat-messages" ref="messagesContainer">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="chat-message"
      :class="{ mine: msg.user.id === user?.id }"
    >
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

    <!-- ✅ sentinel toujours en bas -->
    <div ref="bottomSentinel" aria-hidden="true"></div>
  </div>

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
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

/* Header */
.chat-header {
  background: #007bff;
  color: white;
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Zone messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #fafafa;
}

/* Un message */
.chat-message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  max-width: 80%;

  &.mine {
    margin-left: auto;
    flex-direction: row-reverse;

    .message-content {
      background: #007bff;
      color: white;
      border-bottom-right-radius: 0;
    }
  }
}

.message-content {
  background: #f2f2f2;
  padding: 0.6rem 0.9rem;
  border-radius: 16px;
  max-width: 70%;
  font-size: 0.95rem;
  line-height: 1.4;
  border-bottom-left-radius: 0;

  .message-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 0.2rem;
    opacity: 0.7;
  }

  p {
    margin: 0;
  }
}

/* Avatar */
.chat-avatar img,
.chat-avatar .avatar-fallback {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
}

/* Zone input */
.chat-input {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 0.5rem;
  background: #fff;

  input {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
    outline: none;

    &:focus {
      border-color: #007bff;
    }
  }

  .btn-send {
    margin-left: 0.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.2s;

    &:hover {
      background: #0056b3;
    }
  }
}
</style>