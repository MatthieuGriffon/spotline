<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="admin-dashboard-wrapper">
    <h1>Tableau de bord administrateur</h1>

    <div v-if="authStore.user" class="admin-info">
      <p><strong>Pseudo :</strong> {{ authStore.user.pseudo }}</p>
      <p><strong>Email :</strong> {{ authStore.user.email }}</p>
    </div>

    <div v-else>
      <p>Utilisateur non chargé.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-dashboard-wrapper {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff8e1;
  border-radius: 12px;
  border: 2px solid #fbc02d;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}
.admin-info p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
</style>
