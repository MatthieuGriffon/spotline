<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EditUserModal from '@/components/admin/users/EditUserModal.vue'
import DeleteUserModal from '@/components/admin/users/DeleteUserModal.vue'

const router = useRouter()
const selectedUserToEdit = ref<User | null>(null)
const selectedUserToDelete = ref<User | null>(null)

interface User {
  id: string
  pseudo: string
  email: string
  role: 'USER' | 'ADMIN'
  isBanned: boolean
  isConfirmed?: boolean // ← au cas où
}

const users = ref<User[]>([])
const isLoading = ref(true)

// 🔍 Filtres
const showOnlyAdmins = ref(false)
const showOnlyBanned = ref(false)
const showOnlyUnconfirmed = ref(false)
const searchQuery = ref('')

// ✨ Liste filtrée
const filteredUsers = computed(() =>
  users.value.filter(user => {
    if (showOnlyAdmins.value && user.role !== 'ADMIN') return false
    if (showOnlyBanned.value && !user.isBanned) return false
    if (showOnlyUnconfirmed.value && user.isConfirmed !== false) return false

    const query = searchQuery.value.toLowerCase()
    return (
      user.pseudo.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  })
)

// ⚠️ Fake temporaire — à remplacer par un vrai fetch ensuite
onMounted(() => {
  users.value = Array.from({ length: 25 }, (_, i) => ({
    id: String(i + 1),
    pseudo: `Utilisateur${i + 1}`,
    email: `user${i + 1}@spotline.com`,
    role: i % 5 === 0 ? 'ADMIN' : 'USER',
    isBanned: i % 8 === 0,
    isConfirmed: i % 3 !== 0
  }))
  isLoading.value = false
})
function openEditModal(user: User) {
  selectedUserToEdit.value = user
}

function openDeleteModal(user: User) {
  selectedUserToDelete.value = user
}

function handleUserUpdated(updatedUser: User) {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...updatedUser }
  }
}

function handleUserDeleted(id: string) {
  users.value = users.value.filter(u => u.id !== id)
}
</script>

<template>
  <div class="admin-users">
    <h2>Gestion des utilisateurs</h2>

    <div class="filters">
      <label><input type="checkbox" v-model="showOnlyAdmins" /> Admins</label>
      <label><input type="checkbox" v-model="showOnlyBanned" /> Bannis</label>
      <label><input type="checkbox" v-model="showOnlyUnconfirmed" /> Non confirmés</label>
    </div>

    <input
      type="search"
      class="search-input"
      placeholder="Rechercher par pseudo ou email"
      v-model="searchQuery"
    />

    <div v-if="isLoading" class="loading">Chargement...</div>

    <div v-else-if="filteredUsers.length === 0" class="empty">Aucun utilisateur trouvé.</div>

    <ul class="user-list" v-else>
      <li v-for="user in filteredUsers" :key="user.id" class="user-card">
        <div class="user-info">
          <div class="user-name">{{ user.pseudo }}</div>
          <div class="user-email">{{ user.email }}</div>
          <div class="user-role" :class="user.role.toLowerCase()">{{ user.role }}</div>
          <div v-if="user.isBanned" class="user-banned">Banni</div>
          <div v-if="user.isConfirmed === false" class="user-unconfirmed">Non confirmé</div>
        </div>
        <div class="user-actions">
  <button class="action-btn" aria-label="Modifier" @click="openEditModal(user)">
    <font-awesome-icon icon="pen" class="icon edit" />
  </button>
  <button class="action-btn" aria-label="Supprimer" @click="openDeleteModal(user)">
    <font-awesome-icon icon="trash" class="icon delete" />
  </button>
</div>
      </li>
    </ul>
    <EditUserModal
  v-if="selectedUserToEdit"
  :user="selectedUserToEdit"
  @close="selectedUserToEdit = null"
  @updated="handleUserUpdated"
/>

<DeleteUserModal
  v-if="selectedUserToDelete"
  :user="selectedUserToDelete"
  @close="selectedUserToDelete = null"
  @deleted="handleUserDeleted"
/>
  </div>
</template>

<style scoped lang="scss">
.admin-users {
   padding: var(--space-md);
  padding-bottom: calc(var(--footer-height) + var(--space-xl));
  overflow-y: auto;

  h2 {
    font-size: var(--font-lg);
    color: var(--color-text-inverted);
    text-align: center;
    margin-bottom: var(--space-md);
  }

  .loading {
    text-align: center;
    font-size: var(--font-base);
    color: var(--color-text-muted);
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .user-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-sm);
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .user-name {
    font-weight: 600;
    font-size: var(--font-base);
  }

  .user-email {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }

  .user-role {
    font-size: var(--font-xs);
    font-weight: 500;
    &.admin {
      color: var(--color-primary);
    }
    &.user {
      color: var(--color-group);
    }
  }

  .user-banned {
    font-size: var(--font-xs);
    color: var(--color-error);
    font-weight: 600;
  }

  .user-actions {
    display: flex;
    gap: var(--space-sm);

    .action-btn {
  background: none;
  border: none;
  font-size: var(--font-base);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  &.edit {
    color: var(--color-primary);
  }

  &.delete {
    color: var(--color-error);
  }
}
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
    margin-bottom: var(--space-sm);

    label {
      font-size: var(--font-sm);
      color: var(--color-text-inverted);
      display: flex;
      align-items: center;
      gap: var(--space-xs);

      input[type='checkbox'] {
        accent-color: var(--color-primary);
        transform: scale(1.1);
      }
    }
  }

  .search-input {
    width: 100%;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-base);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-md);
    background: var(--color-background-soft);
    color: var(--color-text);

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  .user-unconfirmed {
    font-size: var(--font-xs);
    color: var(--color-warning);
    font-weight: 600;
  }

  .empty {
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-base);
    margin-top: var(--space-md);
  }
  .icon {
  font-size: var(--font-base);

  &.edit {
    color: var(--color-primary);
  }

  &.delete {
    color: var(--color-error);
  }
}
}
</style>

