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

<style scoped lang="scss">
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-footer, 100);
}

.footer-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100%;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  text-decoration: none;
  gap: 0.25rem;
  transition: color 0.2s ease;

  &.active {
    color: var(--color-primary);
  }

  &:hover {
    color: var(--color-text);
  }
}
</style>
