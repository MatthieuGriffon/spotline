<template>
  <div class="app">
    <h1>Bienvenue sur Spotline</h1>
    <p>La police Quicksand doit s’afficher correctement ici.</p>
  </div>
</template>

<script setup lang="ts">
// toujours rien ici, c’est du style pur
</script>

<style scoped lang="scss">
.app {
  padding: var(--space-lg); // anciennement 2rem
  background-color: var(--color-background-soft);

  h1 {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-primary);
  }

  p {
    font-size: var(--font-base);
    font-weight: 400;
    color: var(--color-text-muted);
  }
}
</style>
