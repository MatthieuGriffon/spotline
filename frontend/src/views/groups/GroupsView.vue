<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGroupsStore } from '@/stores/useGroupsStore'
import { useRouter } from 'vue-router'

const store = useGroupsStore()
const router = useRouter()

const newName = ref('')
const newDescription = ref('')

onMounted(() => {
  store.loadGroups()
})

async function handleCreate() {
  if (!newName.value.trim()) return
  await store.addGroup(newName.value, newDescription.value)
  newName.value = ''
  newDescription.value = ''
}

function confirmDelete(id: string) {
  if (confirm('Supprimer ce groupe ?')) {
    store.removeGroup(id)
  }
}

function goToDetails(id: string) {
  router.push(`/groupes/${id}`)
}
</script>

<template>
  <div class="groups-view">
    <h1>Mes Groupes</h1>

    <div v-if="store.isLoading" class="loading">Chargement...</div>
    <template v-else>
      <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>
      <p v-if="store.successMessage" class="success">{{ store.successMessage }}</p>

      <ul v-if="store.groups.length" class="groups-list">
        <li v-for="group in store.groups" :key="group.id" class="group-item">
          <div class="group-info" @click="goToDetails(group.id)">
            <h2>{{ group.name }}</h2>
            <p v-if="group.description" class="description">{{ group.description }}</p>
            <small>
              {{ group.memberCount }} membre{{ group.memberCount > 1 ? 's' : '' }} • 
              Rôle : {{ group.role }}
            </small>
          </div>
          <button @click.stop="confirmDelete(group.id)" class="delete-btn" aria-label="Supprimer le groupe">
            ❌
          </button>
        </li>
      </ul>

      <div v-else class="empty-state">
        Aucun groupe pour le moment.
      </div>

      <div class="create-form">
        <h2>Créer un groupe</h2>
        <input v-model="newName" placeholder="Nom du groupe" />
        <textarea v-model="newDescription" placeholder="Description (optionnelle)"></textarea>
        <button 
          @click="handleCreate" 
          :disabled="!newName.trim() || store.isLoading">
          Créer
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.groups-view {
  padding: 1rem;
}

.loading {
  text-align: center;
}

.error {
  color: red;
  margin-bottom: 0.5rem;
}

.success {
  color: green;
  margin-bottom: 0.5rem;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f4f4f4;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:active {
    background: #e9e9e9;
  }
}

.group-info {
  flex: 1;
  min-width: 0;

  h2 {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
  }

  .description {
    margin: 0 0 0.25rem;
    font-size: 0.9rem;
    color: #555;
    word-break: break-word;
  }

  small {
    color: #777;
    font-size: 0.8rem;
  }
}

.delete-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #d00;
  cursor: pointer;

  &:hover {
    color: #a00;
  }
}

.create-form {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  input,
  textarea {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.6rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;

    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }
}

.empty-state {
  text-align: center;
  color: #777;
  margin: 1rem 0;
  font-size: 0.9rem;
}

/* 📱 Mobile-first : < 400px */
@media (max-width: 400px) {
  .group-item {
    flex-direction: column;
    gap: 0.5rem;

    .delete-btn {
      align-self: flex-end;
    }
  }

  .create-form button {
    width: 100%;
  }
}
</style>
