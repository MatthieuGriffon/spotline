<template>
  <div class="layout">
    <AppHeader />
    <main class="layout-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; // très important ici
}

.layout-content {
  flex: 1;
  display: flex; 
  flex-direction: column;
  padding-bottom: var(--footer-height);
}

</style>