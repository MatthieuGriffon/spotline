<script setup lang="ts">
const emit = defineEmits(['close'])
</script>

<template>
  <div class="email-sent-backdrop" @click.self="emit('close')" aria-modal="true" role="dialog">
    <div class="email-sent-card">
      <button class="close-btn" @click="emit('close')" aria-label="Fermer">✕</button>
      <h2>Vérifie ta boîte mail ✉️</h2>
      <p>Nous t’avons envoyé un lien de confirmation. Clique dessus pour activer ton compte.</p>
      <button class="ok-btn" @click="emit('close')">OK</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.email-sent-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.email-sent-card {
  background: #fff;
  padding: 2rem;
  max-width: 420px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.ok-btn {
  margin-top: 1.5rem;
  background: #00796b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
