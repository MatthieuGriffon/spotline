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
  height: 100vh; 
  overflow: hidden; 
  
}


.layout-content {
  flex: 1;
  overflow: hidden;
  margin-top: -1.5rem;
}
</style>