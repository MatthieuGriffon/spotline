<script setup lang="ts">
import { onMounted, ref, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupsStore } from '@/stores/useGroupsStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { useBannerStore } from '@/stores/bannerStore' 
import type { GroupInvitationAdminItem } from '@/types/invitations'

const route = useRoute()
const router = useRouter()

const groups = useGroupsStore()
const auth = useAuthStore()
const invitations = useInvitationsStore()
const bannerStore = useBannerStore() 

let redirectedNotFound = false

/** ====== Routing / Id ====== */
const groupId = ref<string>(String(route.params.id ?? ''))

/** ====== Local pending flags ====== */
const pending = ref({
  role: null as string | null,
  remove: null as string | null,
  revoke: null as string | null,
  save: false,
  invite: false,
})

async function loadGroup() {
  if (!auth.user && auth.fetchMe) {
    try {
      await auth.fetchMe()
    } catch {}
  }

  await groups.loadGroupDetails(groupId.value)

  if (!groups.currentGroup) {
    if (!redirectedNotFound) {
      redirectedNotFound = true
      router.replace({ name: 'NotFound' })
    }
    return
  }

  editName.value = groups.currentGroup.name
  editDescription.value = groups.currentGroup.description ?? ''
}

onMounted(async () => {
  await loadGroup()

  // ✅ Si on vient de rejoindre ce groupe, recharger la liste globale
  if (
    bannerStore.recentJoin &&
    bannerStore.recentJoin.groupName === groups.currentGroup?.name
  ) {
    await groups.loadGroups()
  }
})
onMounted(() => {
  if (bannerStore.recentJoin) {
    setTimeout(() => {
      bannerStore.clearRecentJoin()
    }, 5000)
  }
})

watch(
  () => route.params.id,
  async (val) => {
    if (typeof val === 'string' && val !== groupId.value) {
      redirectedNotFound = false
      groupId.value = val
      await loadGroup()
    }
  },
)

/** ====== Computed / Status ====== */
const current = computed(() => groups.currentGroup)
const canManage = computed(() => {
  const meId = auth.user?.id
  const members = groups.currentGroup?.members ?? []
  return !!meId && members.some((m) => m.userId === meId && m.role === 'admin')
})
const admins = computed(() => current.value?.members.filter((m) => m.role === 'admin') ?? [])
const meId = computed(() => auth.user?.id ?? null)
const isSoleAdmin = computed(
  () => !!meId.value && admins.value.length === 1 && admins.value[0]?.userId === meId.value,
)
const invitesLoadingForThisGroup = computed(() => canManage.value && invitations.isLoading)
const isLoading = computed(() => groups.isLoading || invitesLoadingForThisGroup.value)
const groupError = computed(() => groups.errorMessage)
const groupSuccess = computed(() => groups.successMessage)
const invError = computed(() => invitations.errorMessage)
const invSuccess = computed(() => invitations.successMessage)
const groupInvites = computed<GroupInvitationAdminItem[]>(
  () => invitations.groupInvitations[groupId.value] ?? [],
)

/** ====== Invitations auto-load ====== */
const loadingInvitesFor = ref<string | null>(null)
const lastLoadedInvitesFor = ref<string | null>(null)
watchEffect(async () => {
  if (!current.value || !canManage.value) return
  if (loadingInvitesFor.value === groupId.value) return
  if (lastLoadedInvitesFor.value === groupId.value) return

  loadingInvitesFor.value = groupId.value
  try {
    await invitations.loadForGroup(groupId.value)
    lastLoadedInvitesFor.value = groupId.value
  } finally {
    loadingInvitesFor.value = null
  }
})

/** ====== Edit group ====== */
const isEditing = ref(false)
const editName = ref('')
const editDescription = ref('')
const isDirty = computed(() => {
  if (!current.value) return false
  return (
    editName.value.trim() !== current.value.name ||
    (editDescription.value.trim() || '') !== (current.value.description || '')
  )
})
async function saveEdit() {
  if (!current.value) return
  if (!editName.value.trim() || !isDirty.value) return
  pending.value.save = true
  try {
    await groups.editGroup(
      current.value.id,
      editName.value.trim(),
      editDescription.value.trim() || undefined,
    )
    isEditing.value = false
    await groups.loadGroupDetails(groupId.value)
  } finally {
    pending.value.save = false
  }
}

/** ====== Members actions ====== */
async function changeRole(userId: string, role: 'admin' | 'member' | 'guest') {
  if (!current.value) return
  if (isSoleAdmin.value && userId === meId.value && role !== 'admin') {
    alert("Tu es le dernier admin : nomme d'abord un autre admin.")
    return
  }
  pending.value.role = userId
  try {
    await groups.changeRole(current.value.id, userId, role)
    await groups.loadGroupDetails(groupId.value)
  } finally {
    pending.value.role = null
  }
}

async function removeMember(userId: string) {
  if (!current.value) return
  if (admins.value.length === 1 && admins.value[0].userId === userId) {
    alert('Impossible de retirer le dernier admin du groupe.')
    return
  }
  if (userId === meId.value) {
    alert('Pour quitter le groupe, utilise "Quitter le groupe".')
    return
  }
  pending.value.remove = userId
  try {
    await groups.removeMember(current.value.id, userId)
    await groups.loadGroupDetails(groupId.value)
  } finally {
    pending.value.remove = null
  }
}

async function leave() {
  if (!current.value) return
  if (isSoleAdmin.value) {
    alert("Tu es le dernier admin. Transfère d'abord l'admin à quelqu'un d'autre.")
    return
  }
  if (confirm('Quitter ce groupe ?')) {
    await groups.leaveGroupAction(current.value.id)
    router.push('/groupes')
  }
}

function goBack() {
  router.push('/groupes')
}

/** ====== Invitations ====== */
const directEmail = ref('')
const emailError = ref<string | null>(null)
function validateEmail() {
  const value = directEmail.value.trim()
  if (!value) {
    emailError.value = 'Adresse e-mail requise'
    return
  }
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? null
    : 'Adresse e-mail invalide'
}
watch(directEmail, validateEmail)

async function sendDirectInviteByEmail() {
  validateEmail()
  if (emailError.value || !current.value) return
  pending.value.invite = true
  try {
    await invitations.sendDirect(current.value.id, {
      by: 'email',
      email: directEmail.value.trim().toLowerCase(),
      joinAuto: false,
    })
    await invitations.loadForGroup(groupId.value)
    directEmail.value = ''
  } finally {
    pending.value.invite = false
  }
}

const linkExpiresInDays = ref<number | undefined>(7)
const linkMaxUses = ref<number | undefined>(5)
const lastCreatedLink = ref<null | { token: string; url: string; expiresAt: string; maxUses: number }>(null)
async function createInviteLink() {
  if (!current.value) return
  const expires = Number.isFinite(linkExpiresInDays.value ?? NaN) ? linkExpiresInDays.value : undefined
  const max = Number.isFinite(linkMaxUses.value ?? NaN) ? linkMaxUses.value : undefined
  const result = await invitations.createLink(current.value.id, { expiresInDays: expires, maxUses: max })
  lastCreatedLink.value = result
  await invitations.loadForGroup(groupId.value)
}

async function copyToClipboard(text: string) {
  try {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    invitations.setSuccess('Lien copié dans le presse-papiers')
  } catch {
    invitations.setError('Impossible de copier le lien')
  }
}

async function revoke(invitationId: string) {
  if (!current.value) return
  pending.value.revoke = invitationId
  try {
    await invitations.revoke(current.value.id, invitationId)
    await invitations.loadForGroup(groupId.value)
  } finally {
    pending.value.revoke = null
  }
}

async function refreshInvites() {
  if (!current.value) return
  await invitations.loadForGroup(current.value.id)
}

const lastCreatedQR = ref<string | null>(null)
async function createInviteQR() {
  const gid = current.value?.id
  if (!gid) return
  const expires = Number.isFinite(linkExpiresInDays.value ?? NaN) ? linkExpiresInDays.value! : 7
  const max = Number.isFinite(linkMaxUses.value ?? NaN) ? linkMaxUses.value! : 10
  const qr = await invitations.createQR(gid, { expiresInDays: expires, maxUses: max, format: 'png' })
  lastCreatedQR.value = `data:image/png;base64,${qr}`
}
</script>

<template>
  <div class="group-detail-wrapper">
   <div
    v-if="bannerStore.recentJoin && bannerStore.recentJoin.groupName === current?.name"
    class="join-banner"
  >
     Tu as rejoint le groupe {{ bannerStore.recentJoin.groupName }} !
  </div>

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
          Créé le
          <time :datetime="current.createdAt">
            {{ new Date(current.createdAt).toLocaleString() }}
          </time>
          •
          {{ current.members.length }} membre{{ current.members.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Status (group + invitations) -->
      <div v-if="groupError" class="status error" aria-live="polite">{{ groupError }}</div>
      <div v-if="groupSuccess" class="status success" aria-live="polite">{{ groupSuccess }}</div>
      <div v-if="invError" class="status error" aria-live="polite">{{ invError }}</div>
      <div v-if="invSuccess" class="status success" aria-live="polite">{{ invSuccess }}</div>

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
            <button
              class="btn primary"
              @click="saveEdit"
              :disabled="pending.save || !editName.trim() || !isDirty"
            >
              {{ pending.save ? '...' : 'Enregistrer' }}
            </button>
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
              <div class="role">
                Rôle : <strong>{{ m.role }}</strong>
              </div>
            </div>

            <div class="member-actions" v-if="canManage">
              <select
                :value="m.role"
                @change="
                  changeRole(
                    m.userId,
                    ($event.target as HTMLSelectElement).value as 'admin' | 'member' | 'guest',
                  )
                "
                :disabled="
                  pending.role === m.userId ||
                  (isSoleAdmin && m.userId === meId && m.role === 'admin')
                "
                aria-label="Changer le rôle"
              >
                <option value="admin">admin</option>
                <option value="member">member</option>
                <option value="guest">guest</option>
              </select>
              <button
                class="btn danger"
                @click="removeMember(m.userId)"
                :disabled="
                  pending.remove === m.userId ||
                  (admins.length === 1 && admins[0].userId === m.userId) ||
                  m.userId === meId
                "
              >
                {{ pending.remove === m.userId ? '...' : 'Retirer' }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Invitations (ADMIN ONLY) -->
      <section class="section-block" v-if="canManage">
        <div class="card" style="margin-bottom: 0.75rem">
          <h3 class="sub-title">Invitation par e-mail</h3>
          <div class="invite-grid">
            <input
              v-model.trim="directEmail"
              type="email"
              inputmode="email"
              placeholder="email@exemple.com"
              @blur="validateEmail()"
              :class="{ invalid: !!emailError }"
              :aria-invalid="!!emailError"
              :aria-describedby="emailError ? 'email-error' : undefined"
            />
            <button
              class="btn primary"
              @click="sendDirectInviteByEmail"
              :disabled="pending.invite || !directEmail || !!emailError"
            >
              {{ pending.invite ? '...' : 'Envoyer' }}
            </button>
          </div>
          <div v-if="lastCreatedQR">
            <img :src="lastCreatedQR" alt="QR code d’invitation" />
          </div>
          <p v-if="emailError" id="email-error" class="form-error">{{ emailError }}</p>
        </div>

        <div class="card">
          <h3 class="sub-title">Lien d’invitation</h3>
          <div class="invite-link-grid">
            <label>
              <span>Expire dans (jours)</span>
              <input type="number" min="1" step="1" v-model.number="linkExpiresInDays" />
            </label>
            <label>
              <span>Nombre max d’utilisations</span>
              <input type="number" min="1" step="1" v-model.number="linkMaxUses" />
            </label>
            <button class="btn" @click="createInviteLink">Générer lien</button>
            <button class="btn" @click="createInviteQR">Générer QR</button>
          </div>

          <div v-if="lastCreatedLink" class="generated-link">
            <div class="row">
              <span class="mono">{{ lastCreatedLink.url }}</span>
              <button class="btn" @click="copyToClipboard(lastCreatedLink.url)">Copier</button>
            </div>
            <small
              >Expire le {{ new Date(lastCreatedLink.expiresAt).toLocaleString() }} • max
              {{ lastCreatedLink.maxUses }} usages</small
            >
          </div>

          <div class="admin-invites">
            <div class="row between">
              <h4>Invitations actives</h4>
              <button class="btn" @click="refreshInvites">Rafraîchir</button>
            </div>
            <ul class="list">
              <li v-for="inv in groupInvites" :key="inv.id" class="row">
                <div class="col">
                  <div class="title-row">
                    {{ inv.type === 'direct' ? 'Direct' : 'Lien' }}
                    <template v-if="inv.email"> — {{ inv.email }}</template>
                    <span class="badge" :data-status="inv.status" style="margin-left: 0.5rem">
                      {{ inv.status }}
                    </span>
                  </div>
                  <small>
                    créé le
                    <time :datetime="inv.createdAt">{{
                      new Date(inv.createdAt).toLocaleString()
                    }}</time>
                    • exp {{ inv.expiresAt ? new Date(inv.expiresAt).toLocaleString() : '—' }} •
                    uses {{ inv.uses }}/{{ inv.maxUses ?? '∞' }}
                  </small>
                </div>

                <button
                  class="btn danger"
                  @click="revoke(inv.id)"
                  :disabled="
                    pending.revoke === inv.id ||
                    inv.status === 'REVOKED' ||
                    inv.status === 'ACCEPTED'
                  "
                >
                  {{ pending.revoke === inv.id ? '...' : 'Révoquer' }}
                </button>
              </li>
            </ul>
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
  max-width: 100%;
  margin: 0.5rem auto;
  padding: 0.5rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* header */
.page-header {
  background: #1f2937;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  color: var(--color-text-inverted);

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .title {
    margin: 0;
    font-weight: 700;
    color: var(--color-text-inverted);
  }
  .subtitle {
    margin: 0.25rem 0 0;
    color: #e5e7eb;
  }
  .meta {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: #cbd5e1;
  }
}
.actions {
  display: flex;
  gap: 0.5rem;
}

/* status */
.status {
  font-style: italic;
  margin: 0.75rem 0;
  &.error {
    color: var(--color-error);
  }
  &.success {
    color: var(--color-success);
  }
}

/* sections */
.section-block {
  margin-bottom: 1.25rem;
}
.section-title {
  font-size: 1.05rem;
  margin: 0 0 0.5rem;
  color: #111827;
  font-weight: 700;
}
.sub-title {
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: #111827;
}

/* cards / lists */
.card {
  background: var(--color-background-soft);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  box-shadow: var(--shadow-sm);
}
.form-grid {
  display: grid;
  gap: 0.5rem;
}
.form-grid label span {
  display: block;
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0.25rem;
}

.members-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: #f1f5f9;
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}
.member-item .info .pseudo {
  font-weight: 600;
  color: #111827;
}
.member-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.invite-grid {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
}
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #374151;
}

.link-result {
  margin-top: 0.5rem;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.row {
  background: #f1f5f9;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
}
.title-row {
  font-weight: 600;
  color: #111827;
}

/* invitations list */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.invites-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.invite-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
}
.invite-item .line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  background: #e5e7eb;
  color: #111827;
}
.badge[data-status='REVOKED'] {
  background: #fee2e2;
  color: #991b1b;
}
.badge[data-status='PENDING'] {
  background: #e0f2fe;
  color: #075985;
}
.badge[data-status='ACCEPTED'] {
  background: #dcfce7;
  color: #166534;
}
.badge[data-status='DECLINED'] {
  background: #fef9c3;
  color: #854d0e;
}
.muted {
  color: #64748b;
}
.col.actions {
  display: flex;
  align-items: center;
}

/* buttons */
.btn {
  border: none;
  border-radius: var(--radius-md);
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  background: #e5e7eb;
  color: #111827;
}
.btn.primary {
  background: var(--color-primary);
  color: var(--color-text-inverted);
}
.btn.back {
  background: #e5e7eb;
}
.btn.danger {
  background: var(--color-error);
  color: var(--color-text-inverted);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* inputs */
input,
textarea,
select {
  width: 100%;
  padding: 0.55rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  font-size: 1rem;
}

/* skeleton */
.skeleton .skel {
  background: linear-gradient(90deg, #f2f4f7 25%, #e9edf3 37%, #f2f4f7 63%);
  background-size: 400% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.4s ease infinite;
}
.skel-title {
  height: 24px;
  width: 40%;
  margin: 1rem 0;
}
.skel-card {
  height: 64px;
  margin: 0.5rem 0;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.danger-zone {
  display: flex;
  justify-content: flex-end;
}
.join-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  animation: fadeInOut 3s ease forwards;
  z-index: 9999;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  10% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  90% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
}
</style>
