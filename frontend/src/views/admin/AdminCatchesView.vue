<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ReportedPrise } from '@/types/reportedPrise'
import { fetchReportedPrises } from '@/api/adminReportedPrises'
import ModeratePriseModal from '@/components/admin/catches/ModeratePriseModal.vue'
import ModerationLogs from '@/components/admin/moderations/ModerationLogs.vue'


const prises = ref<ReportedPrise[]>([])
const selectedPrise = ref<ReportedPrise | null>(null)
const isLoading = ref(true)
const moderationMessage = ref<string | null>(null)
const moderationLogsRef = ref<InstanceType<typeof ModerationLogs> | null>(null)

onMounted(async () => {
  try {
    prises.value = await fetchReportedPrises()
    console.debug('[DEBUG] Prises signalées récupérées (avec reports):', JSON.parse(JSON.stringify(prises.value)))


  } catch (err) {
    console.error('Erreur chargement prises signalées', err)
  } finally {
    isLoading.value = false
  }
})

function openModeration(prise: ReportedPrise) {
  selectedPrise.value = prise
}

function handleModerationDone(payload: { id: string; action: 'mask' | 'delete' | 'ignore' }) {
  prises.value = prises.value.filter(p => p.id !== payload.id)
  moderationMessage.value = `Prise ${{
    mask: 'masquée',
    delete: 'supprimée',
    ignore: 'marquée comme traitée'
  }[payload.action]} avec succès.`
  moderationLogsRef.value?.refresh()
  setTimeout(() => (moderationMessage.value = null), 4000)
}
</script>
<template>
  <div class="admin-catches">
    <h2>Prises signalées</h2>
    <p v-if="moderationMessage" class="moderation-msg">{{ moderationMessage }}</p>

    <div v-if="isLoading" class="loading">Chargement…</div>
    <div v-else-if="prises.length === 0" class="empty">Aucune prise signalée.</div>

    <ul class="catch-list" v-else>
      <li v-for="prise in prises" :key="prise.id" class="catch-card">
        <img :src="prise.photoUrl" alt="Prise" class="catch-photo" />
        <div class="catch-info">
          <p><strong>Utilisateur :</strong> {{ prise.user.pseudo }}</p>
          <p><strong>Date :</strong> {{ new Date(prise.date).toLocaleDateString() }}</p>
          <p><strong>Description :</strong> {{ prise.description || 'Aucune' }}</p>
          <p><strong>Signalements :</strong></p>
<ul class="report-list">
  <li v-for="(msg, i) in prise.reports" :key="i">– {{ msg }}</li>
</ul>
        </div>
        <button @click="openModeration(prise)">Modérer</button>
      </li>
    </ul>

    <ModeratePriseModal
      v-if="selectedPrise"
      :prise="selectedPrise"
      @close="selectedPrise = null"
      @moderated="handleModerationDone"
    />
    <ModerationLogs ref="moderationLogsRef" />
  </div>
</template>

<style scoped lang="scss">
.admin-catches {
  padding: var(--space-md);
  padding-bottom: calc(var(--footer-height) + var(--space-xl));

  h2 {
    font-size: var(--font-lg);
    color: var(--color-text-inverted);
    text-align: center;
    margin-bottom: var(--space-md);
  }
  .report-list {
  padding-left: 1rem;
  font-size: var(--font-sm);
  color: var(--color-warning);
}
  .loading,
  .empty {
    text-align: center;
    font-size: var(--font-base);
    color: var(--color-text-muted);
    margin-top: var(--space-md);
  }

  .catch-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .catch-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .catch-photo {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .catch-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    font-size: var(--font-sm);
    color: var(--color-text);

    p {
      margin: 0;
      line-height: 1.4;
    }
  }

  button {
    align-self: flex-end;
    margin-top: var(--space-sm);
    padding: var(--space-xs) var(--space-md);
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: var(--font-sm);
    cursor: pointer;

    &:hover {
      background: var(--color-primary-dark);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  .moderation-msg {
     text-align: center;
  font-size: var(--font-sm);
  color: var(--color-success);
  margin-bottom: var(--space-sm);
  animation: fadeIn 0.3s ease-out;
  }
}
</style>
