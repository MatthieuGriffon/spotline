<template>
  <div class="layout">
    <!-- AppHeader ici → à retirer -->
    <main class="layout-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from './AppFooter.vue'
</script>

<style scoped src="../styles/Layout.scss" lang="scss" />