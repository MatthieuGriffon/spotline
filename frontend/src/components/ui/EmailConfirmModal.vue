<script setup lang="ts">
const props = defineProps<{
  message: string
  status: 'success' | 'error'
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div class="email-confirm-backdrop" @click.self="emit('close')">
    <div class="email-confirm-card">
      <button class="close-btn" @click="emit('close')" aria-label="Fermer">✕</button>
      <h2>{{ status === 'success' ? 'Confirmation réussie ✅' : 'Erreur ❌' }}</h2>
      <p>{{ message }}</p>
      <button class="ok-btn" @click="emit('close')">OK</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.email-confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.email-confirm-card {
  background: #fff;
  padding: 2rem;
  max-width: 420px;
  border-radius: 8px;
  text-align: center;
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
}
.ok-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #00796b;
  color: white;
  border: none;
  border-radius: 6px;
}
</style>