<!-- src/components/admin/users/AppModal.vue -->
<template>
  <teleport to="body">
    <div class="modal-backdrop" @click.self="emitClose">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header class="modal-header">
          <slot name="title" />
          <button class="close-btn" @click="emitClose" aria-label="Fermer">
            &times;
          </button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
        <footer class="modal-footer">
          <slot name="actions" />
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])

function emitClose() {
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  padding: var(--space-md);
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  max-width: 30rem;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: var(--color-error);
  }
}

.modal-body {
  padding: var(--space-md);
  font-size: var(--font-base);
  color: var(--color-text);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--color-border);
}
</style>