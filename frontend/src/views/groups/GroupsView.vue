<script setup lang="ts">
import { onMounted, onActivated, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGroupsStore } from '@/stores/useGroupsStore'
import { useRouter, useRoute } from 'vue-router'

const store = useGroupsStore()
const { groups, isLoading, errorMessage, successMessage } = storeToRefs(store)

const router = useRouter()
const route = useRoute()

const newName = ref('')
const newDescription = ref('')

const showConfirm = ref(false)
const targetGroupId = ref<string | null>(null)
const targetGroupName = ref<string>('')

// Charge la liste au premier montage
onMounted(() => {
  store.loadGroups()
})

// Recharge si la page est réactivée (via <KeepAlive>)
onActivated(() => {
  store.loadGroups()
})

// Recharge si on navigue vers /groups
watch(() => route.fullPath, (newPath) => {
  if (newPath === '/groups') {
    store.loadGroups()
  }
})

async function handleCreate() {
  if (!newName.value.trim()) return
  await store.addGroup(newName.value, newDescription.value)
  newName.value = ''
  newDescription.value = ''
}

function askDelete(id: string, name: string) {
  targetGroupId.value = id
  targetGroupName.value = name
  showConfirm.value = true
}

async function confirmDeletion() {
  if (!targetGroupId.value) return
  await store.removeGroup(targetGroupId.value)
  showConfirm.value = false
  targetGroupId.value = null
  targetGroupName.value = ''
}

function cancelDeletion() {
  showConfirm.value = false
  targetGroupId.value = null
  targetGroupName.value = ''
}

function goToDetails(id: string) {
  router.push({ name: 'group-detail', params: { id } })
}
</script>

<template>
  <div class="groups-wrapper">
    <!-- Skeleton -->
    <div v-if="isLoading" class="skeleton">
      <div class="skel skel-title"></div>
      <div class="skel skel-card" v-for="i in 4" :key="i"></div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <h1 class="title">Mes Groupes</h1>
      </div>

      <!-- Status -->
      <div v-if="errorMessage" class="status error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="status success">{{ successMessage }}</div>

      <!-- Liste -->
      <section class="section-block" v-if="groups.length">
        <ul class="groups-list">
          <li
            v-for="(group, index) in groups"
            :key="group.id"
            class="group-item"
            v-motion
            :initial="{ opacity: 0, y: 12, scale: 0.98 }"
            :enter="{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 60, duration: 300 } }"
          >
            <button
              class="group-info"
              @click="goToDetails(group.id)"
              :aria-label="`Ouvrir le groupe ${group.name}`"
            >
              <h2 class="group-name">{{ group.name }}</h2>
              <p v-if="group.description" class="description">{{ group.description }}</p>
              <small class="meta">
                {{ group.memberCount }} membre{{ group.memberCount > 1 ? 's' : '' }} • Rôle : {{ group.role }}
              </small>
            </button>

            <button
              @click.stop="askDelete(group.id, group.name)"
              class="delete-btn"
              :disabled="isLoading"
              aria-label="Supprimer le groupe"
              title="Supprimer"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </li>
        </ul>
      </section>

      <!-- Empty -->
      <section class="section-block" v-else>
        <div class="empty-state">Aucun groupe pour le moment.</div>
      </section>

      <!-- Création -->
      <section class="section-block create-form">
        <h2 class="title">Créer un groupe</h2>
        <input v-model="newName" placeholder="Nom du groupe" />
        <textarea v-model="newDescription" placeholder="Description (optionnelle)"></textarea>
        <button @click="handleCreate" :disabled="!newName.trim() || isLoading">Créer</button>
      </section>
    </div>

    <!-- Modale de confirmation -->
    <transition name="fade">
      <div
        v-if="showConfirm"
        class="modal-backdrop"
        @click.self="cancelDeletion"
        @keydown.esc.prevent="cancelDeletion"
      >
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <h3 id="confirm-title">Supprimer le groupe</h3>
          <p class="modal-text">
            Tu es sûr de vouloir supprimer <strong>{{ targetGroupName }}</strong> ?
            Cette action est irréversible.
          </p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancelDeletion" :disabled="isLoading" autofocus>
              Annuler
            </button>
            <button class="btn btn-danger" @click="confirmDeletion" :disabled="isLoading">
              <font-awesome-icon :icon="['fas', 'trash']" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.groups-wrapper {
  margin: 2.5rem;
  padding: 0.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* Header sombre + titre blanc/gras */
.page-header {
  background: #1f2937;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.title {
  margin: 0;
  font-weight: 700;
  color: #fff;
}

/* Status */
.status {
  font-style: italic;
  color: #666;
  margin: 0.75rem 0;
  &.error { color: red; }
  &.success { color: #0d9488; }
}

/* Section */
.section-block { margin-bottom: 1.25rem; }

/* Liste de groupes */
.groups-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.group-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0.75rem;
  transition: background 0.2s ease, transform 0.06s ease;

  &:hover { background: #e2e8f0; }
  &:active { transform: scale(0.995); }
}
.group-info {
  display: block;
  text-align: left;
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  .group-name {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
    font-weight: 600;
    color: #1f2937;
  }
  .description {
    margin: 0 0 0.25rem;
    font-size: 0.92rem;
    color: #6b7280;
    word-break: break-word;
  }
  .meta {
    color: #64748b;
    font-size: 0.82rem;
  }
}
.delete-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #d00;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover { color: #a00; }
  &:disabled { color: #999; cursor: not-allowed; }
}

/* Création */
.create-form .title {
  display: inline-block;
  background: #1f2937;
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  margin: 0 0 0.75rem;
  font-size: 1rem;
}
.create-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  input, textarea {
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    font-size: 1rem;
    background: #fff;
  }
  button {
    align-self: start;
    background: #0d9488;
    color: #fff;
    border: none;
    padding: 0.65rem 1rem;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: filter 0.15s ease;

    &:hover { filter: brightness(0.95); }
    &:disabled { background: #94a3b8; cursor: not-allowed; }
  }
}

/* Empty */
.empty-state {
  text-align: center;
  color: #6b7280;
  padding: 0.75rem 0;
  font-size: 0.95rem;
}

/* Modale */
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 1rem;
}
.modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow:
    0 10px 15px -3px rgba(0,0,0,.1),
    0 4px 6px -4px rgba(0,0,0,.1);
}
.modal h3 {
  margin: 0 0 .5rem;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 700;
}
.modal-text {
  margin: 0 0 1rem;
  color: #374151;
  line-height: 1.4;
}
.modal-actions {
  display: flex;
  gap: .5rem;
  justify-content: flex-end;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .55rem .9rem;
  border-radius: 10px;
  border: none;
  font-size: .95rem;
  cursor: pointer;
}
.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}
.btn-danger {
  background: #dc2626;
  color: #fff;
}

/* Skeleton */
.skeleton {
  .skel {
    background: linear-gradient(90deg, #f2f4f7 25%, #e9edf3 37%, #f2f4f7 63%);
    background-size: 400% 100%;
    border-radius: 8px;
    animation: shimmer 1.4s ease infinite;
  }
  .skel-title { height: 24px; width: 40%; margin: 1rem 0; }
  .skel-card { height: 64px; margin: 0.5rem 0; }
}
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* Mobile */
@media (max-width: 400px) {
  .delete-btn { align-self: flex-start; }
  .create-form button { width: 100%; }
}
</style>

