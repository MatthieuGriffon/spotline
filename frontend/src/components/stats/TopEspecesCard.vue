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

<style scoped src="../styles/TopEspecesCard.scss" lang="scss" />
