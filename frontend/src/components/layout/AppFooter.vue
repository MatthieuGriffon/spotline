<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed } from 'vue'

const route = useRoute()
const authStore = useAuthStore()

const isActive = (path: string) => route.path.startsWith(path)

const dashboardRoute = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  if (role === 'admin') return '/admin'
  if (role === 'user') return '/dashboard'
  return '/'
})
</script>

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
      <RouterLink
  :to="dashboardRoute"
  class="nav-item"
  :class="{ active: isActive(dashboardRoute) }"
>
  <font-awesome-icon icon="user" />
  <span>Dashboard</span>
</RouterLink>
    </nav>
  </footer>
</template>


<style scoped src="../styles/AppFooter.scss" lang="scss" />
