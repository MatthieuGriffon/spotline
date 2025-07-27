<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard-wrapper">
    <h1>Mon tableau de bord</h1>

    <div v-if="authStore.user" class="user-info">
      <p><strong>Pseudo :</strong> {{ authStore.user.pseudo }}</p>
      <p><strong>Email :</strong> {{ authStore.user.email }}</p>
    </div>

    <div v-else>
      <p>Utilisateur non chargé.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-wrapper {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}
.user-info p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
</style>