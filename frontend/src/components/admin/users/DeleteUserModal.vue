<!-- src/components/admin/users/DeleteUserModal.vue -->
<template>
  <AppModal @close="emit('close')">
    <template #title>
      Supprimer un utilisateur
    </template>

    <p class="confirm-text">
      Es-tu sûr de vouloir supprimer <strong>{{ user.pseudo }}</strong> ?<br />
      Cette action est <span class="danger">irréversible</span>.
    </p>

    <template #actions>
      <button class="btn cancel" @click="emit('close')">Annuler</button>
      <button class="btn delete" @click="handleDelete" :disabled="isLoading">
        {{ isLoading ? 'Suppression…' : 'Supprimer' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppModal from './AppModal.vue'

const props = defineProps<{
  user: {
    id: string
    pseudo: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted', id: string): void
}>()

const isLoading = ref(false)

async function handleDelete() {
  isLoading.value = true
  try {
    // 💡 Remplace par un vrai appel à ton endpoint DELETE
    await new Promise(resolve => setTimeout(resolve, 600))
    emit('deleted', props.user.id)
    emit('close')
  } catch (err) {
    console.error('Erreur suppression utilisateur :', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.confirm-text {
  font-size: var(--font-base);
  text-align: center;
  line-height: 1.5;

  strong {
    color: var(--color-primary);
  }

  .danger {
    color: var(--color-error);
    font-weight: 600;
  }
}

.btn {
  font-size: var(--font-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;

  &.cancel {
    background: var(--color-border);
    color: var(--color-text);
  }

  &.delete {
    background: var(--color-error);
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
