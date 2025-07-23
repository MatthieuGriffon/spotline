<template>
  <footer class="app-footer">
    <nav class="footer-nav">
      <RouterLink to="/map" class="nav-item" :class="{ active: isActive('/map') }">
        <font-awesome-icon icon="map" />
        <span>Carte</span>
      </RouterLink>
      <RouterLink to="/catches" class="nav-item" :class="{ active: isActive('/catches') }">
        <font-awesome-icon icon="fish" />
        <span>Prises</span>
      </RouterLink>
      <RouterLink to="/groups" class="nav-item" :class="{ active: isActive('/groups') }">
        <font-awesome-icon icon="users" />
        <span>Groupes</span>
      </RouterLink>
      <RouterLink to="/sessions" class="nav-item" :class="{ active: isActive('/sessions') }">
        <font-awesome-icon icon="sun" />
        <span>Sessions</span>
      </RouterLink>
      <RouterLink to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
        <font-awesome-icon icon="user" />
        <span>Profil</span>
      </RouterLink>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const isActive = (path: string) => route.path.startsWith(path)
</script>

<style scoped src="../styles/AppFooter.scss" lang="scss" />
