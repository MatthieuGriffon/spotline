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

<style scoped src="../styles/Layout.scss" lang="scss" />