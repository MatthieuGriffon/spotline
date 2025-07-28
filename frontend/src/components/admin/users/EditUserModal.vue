<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppModal from './AppModal.vue'
import type { User } from '@/types/user'
import { updateUser } from '@/api/adminUsers'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', updatedUser: {
    id: string
    pseudo: string
    role: 'USER' | 'ADMIN'
    isBanned: boolean
  }): void
}>()

const form = reactive({
  pseudo: props.user.pseudo,
  role: props.user.role,
  isBanned: props.user.isBanned
})

const isLoading = ref(false)

async function handleSubmit() {
  isLoading.value = true
  try {
    const updated = await updateUser(props.user.id, {
      pseudo: form.pseudo,
      role: form.role,
      isBanned: form.isBanned
    })

    emit('updated', updated)
    emit('close')
  } catch (err) {
    console.error('Erreur édition utilisateur :', err)
  } finally {
    isLoading.value = false
  }
}
</script>


<!-- src/components/admin/users/EditUserModal.vue -->
<template>
  <AppModal @close="emit('close')">
    <template #title>
      Modifier un utilisateur
    </template>

    <form @submit.prevent="handleSubmit" class="edit-form">
      <label>
        Pseudo :
        <input v-model="form.pseudo" type="text" required />
      </label>

      <label>
        Rôle :
        <select v-model="form.role">
          <option value="USER">Utilisateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
      </label>

      <label class="ban-checkbox">
        <input type="checkbox" v-model="form.isBanned" />
        Banni
      </label>

      <div class="actions">
        <button type="button" class="btn cancel" @click="emit('close')">Annuler</button>
        <button type="submit" class="btn save" :disabled="isLoading">
          {{ isLoading ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </AppModal>
</template>



<style scoped lang="scss">
.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);

  label {
    display: flex;
    flex-direction: column;
    font-size: var(--font-sm);
    color: var(--color-text);

    input[type="text"],
    select {
      margin-top: var(--space-xs);
      padding: var(--space-xs);
      font-size: var(--font-base);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-background-soft);
      color: var(--color-text);
    }
  }

  .ban-checkbox {
    flex-direction: row;
    align-items: center;
    gap: var(--space-xs);
    font-weight: 500;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
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

    &.save {
      background: var(--color-primary);
      color: white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>