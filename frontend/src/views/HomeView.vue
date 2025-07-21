<script setup lang="ts">
import Layout from '@/components/layout/Layout.vue'
import PriseSlider from '@/components/layout/home/PriseSlider.vue'
import MiniMap from '@/components/ui/MiniMap.vue'

const lastPrises = [
  { id: '1', imageUrl: '/img/demo1.webp', espece: 'Brochet' },
  { id: '2', imageUrl: '/img/demo2.webp', espece: 'Carpe' },
  { id: '3', imageUrl: '/img/demo3.jpg', espece: 'Truite' },
]

const mockSpots = [
  { id: 's1', lat: 47.22, lng: -1.55, label: 'Loire sauvage' },
  { id: 's2', lat: 47.24, lng: -1.53, label: 'Étang des pêcheurs' },
  { id: 's3', lat: 47.23, lng: -1.56, label: 'Bras caché' },
]
</script>

<template>
  <Layout>
    <div class="hero-illustration-wrapper">
      <div class="hero-content">
        <div class="hero-illustration">
          <img src="@/assets/images/spotline-central.webp" alt="Scène de pêche" />
        </div>
        <div class="hero-text-group">
          <div class="hero-presentation">
            <h1>Bienvenue sur Spotline</h1>
            <p>
              Spotline est l’application collaborative pensée pour les passionné·e·s de pêche.  
              Crée ton groupe, partage tes spots sur carte, publie tes prises, et organise des sessions !
            </p>
          </div>

        <div class="hero-presentation-secondary">
  <h2>Dernières prises</h2>
  <PriseSlider :prises="lastPrises" />
</div>
        </div>
      </div>
      <div class="hero-map-preview">
  <h2>Spots partagés récemment</h2>
  <MiniMap :spots="mockSpots" />
  <button class="see-more-btn">Voir tous les spots</button>
</div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">

.hero-illustration-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: rgb(23, 58, 67);

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);

  @include respond(md) {
    justify-content: flex-start; // au lieu de center, si jamais c’est trop “flottant”
  }

  @include respond(lg) {
    flex-direction: row;
    align-items: stretch;
    gap: var(--space-xl);
    margin-top: 4rem;
    min-height: auto;
  }
}
.hero-text-group {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-md); // fallback mobile
  align-items: center;

  @include respond(lg) {
    align-items: stretch;
    height: 100%; // va s’adapter à la hauteur de la colonne
  }
}

  .hero-illustration {
    width: 90%;
    max-width: 500px;
  }

  .hero-illustration {
    background-color: #c1bdbd;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateY(-3.1rem);

    @include respond(sm) {
    margin-top:  0rem;
  }

  @include respond(md) {
    transform: translateY(3rem); // plus neutre
  }

  @include respond(lg) {
    transform: none; // 
     height: 100%;
  }

    @include respond(lg) {
      transform: none;
      max-width: 600px;
      padding: 0.5rem;
    
    }

    img {
      width: 100%;
      height: auto;
      border-radius: var(--radius-md);
      object-fit: cover;
      object-position: center;
      display: block;
    }
  }

  .hero-presentation {
    margin-top: 6rem;
    background-color: var(--color-background);
    border: 6px solid #c1bdbd;
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    box-shadow: var(--shadow-md);
    text-align: justify;

    @include respond(md) {
      padding: var(--space-xl);
      text-align: left;

      h1 {
        font-size: var(--font-title);
        margin-bottom: var(--space-md);
      }

      p {
        font-size: var(--font-base);
      }
    }

    @include respond(lg) {
      margin-top: 0;
    }

    h1 {
      font-size: var(--font-lg);
      font-weight: 700;
      margin-bottom: var(--space-sm);
      color: var(--color-primary);
    }

    p {
      font-size: var(--font-sm);
      color: var(--color-text-muted);
      line-height: 1.6;
    }
  }

 .hero-presentation-secondary {
  display: none; // 🚫 caché par défaut
  width: 100%;

  @include respond(lg) {
    display: block; // ✅ visible à partir de lg
    background-color: var(--color-background);
    border: 6px solid #c1bdbd;
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    width: 100%;
    max-width: 1240px;
    box-shadow: var(--shadow-md);
    color: var(--color-text-muted);
    font-size: var(--font-base);
    line-height: 1.6;
    text-align: left;

    opacity: 0;
    transform: translateY(1rem);
    animation: fadeInUp 0.4s ease-out forwards;

    h2 {
      font-size: var(--font-lg);
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: var(--space-md);
    }
  }
}

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
.hero-map-preview {
   opacity: 0;
   transform: translateY(1rem);
   animation: fadeInUp 0.4s ease-out forwards;
   display: none;
   margin-bottom: var(--space-xl);

  @include respond(lg) {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    background-color: var(--color-background);
    border: 6px solid #c1bdbd;
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    max-width: 1240px;
    width: 90%;
    box-shadow: var(--shadow-md);

    h2 {
      font-size: var(--font-lg);
      font-weight: 700;
      color: var(--color-primary);
    }

    .see-more-btn {
      align-self: flex-end;
      background-color: var(--color-primary);
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--font-sm);
      cursor: pointer;
    }
  }
}
</style>
