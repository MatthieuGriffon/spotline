<script setup lang="ts">
import { Splide, SplideSlide } from '@splidejs/vue-splide'

type Prise = {
  id: string
  imageUrl: string
  espece: string
}

defineProps<{
  prises: Prise[]
}>()

const options = {
  type: 'loop',
  gap: '1rem',
  perPage: 1,
  autoplay: true,
  keyboard: true,

  pagination: true,
  breakpoints: {
    1440: { perPage: 2 }, // correspond à $breakpoint-laptop
    1024: { perPage: 1 }, // correspond à $breakpoint-tablet-lg
    768: { perPage: 1 },  // correspond à $breakpoint-tablet
  },
  speed: 600,
easing: 'ease',
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: false,
    focus: 'center',
    trimSpace: false,
    arrows: true,
};
</script>

<template>
  <div class="prise-slider">
    <Splide v-if="prises.length" :options="options" aria-label="Dernières prises publiées">
      <SplideSlide v-for="prise in prises" :key="prise.id">
  <div class="slide-card">
    <img :src="prise.imageUrl" :alt="`Prise de ${prise.espece}`" />
    <span class="badge">{{ prise.espece }}</span>
  </div>
</SplideSlide>
    </Splide>

    <p v-else class="prise-slider__empty">Aucune prise à afficher pour l'instant.</p>
  </div>
</template>

<style scoped lang="scss">
.prise-slider {
  width: 100%;
  max-width: 100%;

  img {
    width: 100%;
    height: auto;
    max-height: 20rem; // ✅ hauteur adaptée pour 4K
    border-radius: var(--radius-md);
    object-fit: cover;
    box-shadow: var(--shadow-sm);
    border: 4px solid var(--color-surface);
    background-color: var(--color-background-soft);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

    @include respond(4k) {
      object-fit: contain;
      max-height: 20rem;
    }
  }
.slide-card {
  position: relative;
  cursor: pointer;

  .badge {
    position: absolute;
    bottom: var(--space-sm);
    right: var(--space-sm);
    background-color: var(--color-primary);
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-size: var(--font-xs);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
  }
}

img:hover {
  transform: scale(1.5);
}

  .prise-slider__empty {
    text-align: center;
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    padding: var(--space-md);
  }
}
</style>