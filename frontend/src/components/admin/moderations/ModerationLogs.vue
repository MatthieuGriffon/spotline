<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchModerationLogs } from '@/api/adminModerationLogs'
import type { ModerationLog } from '@/types/moderationLogs'

const logs = ref<ModerationLog[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

async function refresh() {
  isLoading.value = true
  error.value = null
  try {
    logs.value = await fetchModerationLogs()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    isLoading.value = false
  }
}

onMounted(refresh)
defineExpose({ refresh })
</script>

<template>
  <div class="moderation-logs-container">
    <h3>Historique des modérations</h3>

    <div v-if="isLoading" class="status">Chargement…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="logs.length === 0" class="status">Aucune action enregistrée.</div>

    <div class="log-table" v-else>
      <table>
        <thead>
          <tr>
            <th>Prise</th>
            <th>Utilisateur</th>
            <th>Action</th>
            <th>Par</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
            :class="{ deleted: log.action === 'delete' }"
          >
            <td>{{ log.espece || '—' }}</td>
            <td>{{ log.pseudo || '—' }}</td>
            <td>{{ formatAction(log.action) }}</td>
            <td>{{ log.adminPseudo }}</td>
            <td>{{ new Date(log.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
function formatAction(action: 'mask' | 'delete' | 'ignore') {
  return {
    mask: 'Masquée',
    delete: 'Supprimée',
    ignore: 'Ignorée'
  }[action]
}
</script>

<style scoped lang="scss">
.moderation-logs-container {
  position: sticky;
  bottom: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-sm) var(--space-sm);
  margin-top: var(--space-lg); // 💨 un peu d'air avec le reste de la page
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 6px 6px 0 0;

  h3 {
    font-size: var(--font-base);
    margin-bottom: var(--space-xs);
    color: var(--color-text-inverted);
    font-weight: 600;
  }

  .status {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    padding: var(--space-sm);
    text-align: center;

    &.error {
      color: var(--color-danger);
    }
  }

  .log-table {
    overflow-x: auto;

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-sm);

      th,
      td {
        padding: var(--space-xs);
        text-align: left;
        border-bottom: 1px solid var(--color-border);
      }

      th {
        background: var(--color-surface-alt);
        color: var(--color-text-muted);
        font-weight: 500;
      }

      tr.deleted td {
        color: var(--color-danger);
        font-style: italic;
      }

      tr:hover {
        background: var(--color-surface-hover);
      }
    }
  }
}
</style>