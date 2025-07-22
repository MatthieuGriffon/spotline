<template>
  <div class="top-especes-card">
    <h2>Top espèces de la semaine</h2>
    <ul>
      <li v-for="espece in especes" :key="espece.id">
        <img :src="espece.imageUrl" :alt="espece.nom" />
        <div class="info">
          <span class="nom">{{ espece.nom }}</span>
          <div class="bar">
            <div
              class="progress"
              :style="{ width: getProgressWidth(espece.count) + '%' }"
            ></div>
          </div>
          <span class="count">{{ espece.count }} prise{{ espece.count > 1 ? 's' : '' }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  especes: {
    id: string
    nom: string
    count: number
    imageUrl: string
  }[]
}>()

/**
 * Pourcentage relatif sur une base max de 5 prises (modifiable)
 */
const getProgressWidth = (count: number) => {
  const max = 5
  return Math.min(100, (count / max) * 100)
}
</script>

<style scoped lang="scss">
.top-especes-card {
  background-color: var(--color-background);
  border: 6px solid #c1bdbd;
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);

  h2 {
    font-size: var(--font-lg);
    color: var(--color-primary);
    margin-bottom: var(--space-md);
  }

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  li {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  img {
    width: 50px;
    height: 50px;
    border-radius: var(--radius-sm);
    object-fit: cover;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .nom {
    font-weight: 600;
  }

  .bar {
    background: var(--color-border);
    height: 8px;
    border-radius: 4px;
    overflow: hidden;

    .progress {
      background: var(--color-primary);
      height: 100%;
      transition: width 0.3s ease;
    }
  }

  .count {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }
}
</style>
