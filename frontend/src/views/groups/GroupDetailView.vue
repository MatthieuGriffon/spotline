<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupsStore } from '@/stores/useGroupsStore'
import { useAuthStore } from '@/stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const store = useGroupsStore()
const auth = useAuthStore()

const groupId = ref(String(route.params.id))

// États locaux (édition + invitation)
const isEditing = ref(false)
const editName = ref('')
const editDescription = ref('')

const inviteUserId = ref('')
const inviteRole = ref<'admin' | 'member' | 'guest'>('member')

// ----- Data loading -----
async function load() {
  await store.loadGroupDetails(groupId.value)

  if (!store.currentGroup) {
    // Si pas trouvé → redirection vers NotFound
    router.replace({ name: 'NotFound' })
    return
  }

  editName.value = store.currentGroup.name
  editDescription.value = store.currentGroup.description ?? ''
}

onMounted(load)

watch(() => route.params.id, (val) => {
  if (typeof val === 'string') {
    groupId.value = val
    load()
  }
})

// ----- Computed -----
const current = computed(() => store.currentGroup)
const isLoading = computed(() => store.isLoading)
const errorMessage = computed(() => store.errorMessage)
const successMessage = computed(() => store.successMessage)

const canManage = computed(() => {
  const meId = auth.user?.id
  const members = store.currentGroup?.members ?? []
  return !!meId && members.some(m => m.userId === meId && m.role === 'admin')
})

// ----- Actions -----
async function saveEdit() {
  if (!current.value) return
  await store.editGroup(current.value.id, editName.value.trim(), editDescription.value.trim() || undefined)
  isEditing.value = false
}

async function sendInvite() {
  if (!current.value || !inviteUserId.value.trim()) return
  await store.inviteUser(current.value.id, inviteUserId.value.trim(), inviteRole.value)
  inviteUserId.value = ''
  inviteRole.value = 'member'
  await store.loadGroupDetails(groupId.value) // <-- .value
}

async function changeRole(userId: string, role: 'admin' | 'member' | 'guest') {
  if (!current.value) return
  await store.changeRole(current.value.id, userId, role)
  await store.loadGroupDetails(groupId.value) // <-- .value
}

async function removeMember(userId: string) {
  if (!current.value) return
  await store.removeMember(current.value.id, userId)
  await store.loadGroupDetails(groupId.value) // <-- .value
}

async function leave() {
  if (!current.value) return
  if (confirm('Quitter ce groupe ?')) {
    await store.leaveGroupAction(current.value.id)
    router.push('/groupes')
  }
}

function goBack() {
  router.push('/groupes')
}
</script>

<template>
  <div class="group-detail-wrapper">
    <!-- Skeleton -->
    <div v-if="isLoading" class="skeleton">
      <div class="skel skel-title"></div>
      <div class="skel skel-card" v-for="i in 3" :key="i"></div>
    </div>

    <div v-else-if="!current">
      <div class="status error">Groupe introuvable.</div>
      <button class="btn back" @click="goBack">Retour</button>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-row">
          <h1 class="title">{{ current.name }}</h1>
          <div class="actions">
            <button class="btn back" @click="goBack">Retour</button>
            <button
              v-if="canManage"
              class="btn primary"
              @click="isEditing = !isEditing"
              :aria-pressed="isEditing"
            >
              {{ isEditing ? 'Annuler' : 'Modifier' }}
            </button>
          </div>
        </div>
        <p v-if="current.description" class="subtitle">{{ current.description }}</p>
        <div class="meta">
          Créé le <time :datetime="current.createdAt">{{ new Date(current.createdAt).toLocaleString() }}</time> •
          {{ current.members.length }} membre{{ current.members.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Status -->
      <div v-if="errorMessage" class="status error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="status success">{{ successMessage }}</div>

      <!-- Édition du groupe -->
      <section class="section-block" v-if="isEditing && canManage">
        <div class="card">
          <h2 class="section-title">Éditer le groupe</h2>
          <div class="form-grid">
            <label>
              <span>Nom</span>
              <input v-model="editName" placeholder="Nom du groupe" />
            </label>
            <label>
              <span>Description</span>
              <textarea v-model="editDescription" placeholder="Description"></textarea>
            </label>
          </div>
          <div class="row-actions">
            <button class="btn" @click="isEditing = false">Annuler</button>
            <button class="btn primary" @click="saveEdit" :disabled="!editName.trim()">Enregistrer</button>
          </div>
        </div>
      </section>

      <!-- Membres -->
      <section class="section-block">
        <h2 class="section-title">Membres</h2>
        <ul class="members-list">
          <li v-for="m in current.members" :key="m.userId" class="member-item">
            <div class="info">
              <div class="pseudo">{{ m.pseudo }}</div>
              <div class="role">Rôle : <strong>{{ m.role }}</strong></div>
            </div>

            <div class="member-actions" v-if="canManage">
              <select
                :value="m.role"
                @change="changeRole(m.userId, ($event.target as HTMLSelectElement).value as any)"
                aria-label="Changer le rôle"
              >
                <option value="admin">admin</option>
                <option value="member">member</option>
                <option value="guest">guest</option>
              </select>
              <button class="btn danger" @click="removeMember(m.userId)" :disabled="isLoading">
                Retirer
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Invitation -->
      <section class="section-block" v-if="canManage">
        <div class="card">
          <h2 class="section-title">Inviter un utilisateur</h2>
          <div class="invite-grid">
            <input v-model="inviteUserId" placeholder="ID utilisateur" />
            <select v-model="inviteRole" aria-label="Rôle attribué">
              <option value="member">member</option>
              <option value="guest">guest</option>
              <option value="admin">admin</option>
            </select>
            <button class="btn primary" @click="sendInvite" :disabled="!inviteUserId.trim()">Inviter</button>
          </div>
        </div>
      </section>

      <!-- Sessions (résumé) -->
      <section class="section-block" v-if="current.sessions?.length">
        <h2 class="section-title">Sessions</h2>
        <ul class="list">
          <li v-for="s in current.sessions" :key="s.id" class="row">
            <div class="col">
              <div class="title-row">{{ s.title }}</div>
              <small>
                <time :datetime="s.date">{{ new Date(s.date).toLocaleString() }}</time>
                — lat {{ s.latitude }}, lng {{ s.longitude }}
              </small>
            </div>
          </li>
        </ul>
      </section>

      <!-- Prises (résumé) -->
      <section class="section-block" v-if="current.prises?.length">
        <h2 class="section-title">Prises</h2>
        <ul class="list">
          <li v-for="p in current.prises" :key="p.id" class="row">
            <div class="col">
              <div class="title-row">{{ p.espece }}</div>
              <small>
                <time :datetime="p.date">{{ new Date(p.date).toLocaleDateString() }}</time>
                — lat {{ p.latitude }}, lng {{ p.longitude }}
              </small>
            </div>
          </li>
        </ul>
      </section>

      <!-- Quitter le groupe -->
      <section class="section-block danger-zone">
        <button class="btn danger" @click="leave">Quitter le groupe</button>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.group-detail-wrapper {
  max-width: 90%;
  margin: 0.5rem auto;
  padding: 0.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0,0,0,0.05);
}

/* header */
.page-header {
  background: #1f2937;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #fff;

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
  }
  .title { margin: 0; font-weight: 700; color: #fff; }
  .subtitle { margin: .25rem 0 0; color: #e5e7eb; }
  .meta { margin-top: .25rem; font-size: .9rem; color: #cbd5e1; }
}
.actions { display: flex; gap: .5rem; }

/* status */
.status { font-style: italic; margin: .75rem 0;
  &.error { color: #dc2626; }
  &.success { color: #0d9488; }
}

/* sections */
.section-block { margin-bottom: 1.25rem; }
.section-title { font-size: 1.05rem; margin: 0 0 .5rem; color: #111827; font-weight: 700; }

/* cards / lists */
.card {
  background: #f9fafb;
  border-radius: 10px;
  padding: .75rem;
}
.form-grid { display: grid; gap: .5rem; }
.form-grid label span { display: block; font-size: .9rem; color: #374151; margin-bottom: .25rem; }

.members-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: .5rem; }
.member-item {
  display: flex; align-items: center; justify-content: space-between; gap: .75rem;
  background: #f1f5f9; border-radius: 10px; padding: .6rem .75rem;
}
.member-item .info .pseudo { font-weight: 600; color: #111827; }
.member-actions { display: flex; align-items: center; gap: .5rem; }

.invite-grid { display: grid; grid-template-columns: 1fr auto auto; gap: .5rem; }

.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: .5rem; }
.row { background: #f1f5f9; padding: .6rem .75rem; border-radius: 10px; }
.title-row { font-weight: 600; color: #111827; }

/* buttons */
.btn {
  border: none; border-radius: 10px; padding: .55rem .9rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: .4rem; font-size: .95rem;
  background: #e5e7eb; color: #111827;
}
.btn.primary { background: #0d9488; color: #fff; }
.btn.back { background: #e5e7eb; }
.btn.danger { background: #dc2626; color: #fff; }

/* inputs */
input, textarea, select {
  width: 100%;
  padding: .55rem .6rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 1rem;
}

/* skeleton */
.skeleton .skel {
  background: linear-gradient(90deg,#f2f4f7 25%,#e9edf3 37%,#f2f4f7 63%);
  background-size: 400% 100%;
  border-radius: 8px;
  animation: shimmer 1.4s ease infinite;
}
.skel-title { height: 24px; width: 40%; margin: 1rem 0; }
.skel-card { height: 64px; margin: 0.5rem 0; }
@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

.danger-zone { display:flex; justify-content:flex-end; }
</style>
