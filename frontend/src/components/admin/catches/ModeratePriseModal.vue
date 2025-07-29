<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/admin/users/AppModal.vue'
import type { ReportedPrise } from '@/types/reportedPrise'
import { moderateReportedPrise } from '@/api/adminReportedPrises'

const props = defineProps<{
  prise: ReportedPrise
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'moderated', id: string): void
}>()

const action = ref<'mask' | 'delete' | 'ignore'>('mask')
const isLoading = ref(false)

async function handleModeration() {
  isLoading.value = true
  try {
    await moderateReportedPrise(props.prise.id, { action: action.value })
    emit('moderated', props.prise.id)
    emit('close')
  } catch (err) {
    console.error('Erreur de modération de la prise :', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppModal @close="emit('close')">
    <template #title>Modérer une prise</template>

    <div class="prise-info">
      <img :src="prise.photoUrl" alt="Photo de la prise" class="prise-img" />
      <p class="description">{{ prise.description || 'Aucune description' }}</p>
      <p class="meta">
        Postée par <strong>{{ prise.user.pseudo }}</strong>
        dans <em>{{ prise.groupName || 'groupe inconnu' }}</em>
        le {{ new Date(prise.date).toLocaleDateString() }}
      </p>
    </div>

    <form @submit.prevent="handleModeration" class="moderation-form">
      <label>
        Action :
        <select v-model="action">
          <option value="mask">Masquer (privée)</option>
          <option value="delete">Supprimer</option>
          <option value="ignore">Ignorer (marquer comme traité)</option>
        </select>
      </label>

      <div class="actions">
        <button type="button" class="btn cancel" @click="emit('close')">Annuler</button>
        <button type="submit" class="btn save" :disabled="isLoading">
          {{ isLoading ? 'Traitement...' : 'Valider' }}
        </button>
      </div>
    </form>
  </AppModal>
</template>

<style scoped lang="scss">
.prise-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);

  .prise-img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: var(--radius-md);
  }

  .description {
    font-size: var(--font-base);
    color: var(--color-text);
  }

  .meta {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }
}

.moderation-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);

  select {
    padding: var(--space-xs);
    font-size: var(--font-base);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }
}
</style>