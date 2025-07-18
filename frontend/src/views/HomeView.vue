<script setup lang="ts">
import Layout from '@/components/layout/Layout.vue'
</script>

<template>
  <Layout>
    <div class="hero-illustration">
    <img src="@/assets/images/spotline-central.webp" alt="Scène de pêche" />
  </div>
  </Layout>
</template>


<style scoped lang="scss">
.hero-illustration {
  position: relative;
  z-index: 1;
  margin-top: -5.5rem; // correspond à la hauteur du header (6rem) - un petit delta pour le border-radius
  overflow: hidden;
  height: 32rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 30% center;
    display: block;
  }

  @include respond(mobile-xs) {
    height: 48rem;
    img {
      object-position: 40% center;
      object-fit: cover;
       
    }
  }

  @include respond(mobile-sm) {
    height: 40rem;
  }

  @include respond(mobile-md) {
    height: 57rem;
  }

  @include respond(tablet-fold) {
    height: 68rem;
  }

  @include respond(tablet) {
    height: 68rem;
    img {
      object-position: 40% center;
    }
  }

  @include respond(tablet-lg) {
    height: 80rem;
    img {
      object-position: 50% center;
    }
  }

  @include respond(laptop-sm) {
    height: 50rem;
    img {
      object-position: 50% 60%;
    }
  }

  @include respond(laptop) {
    height: 58rem;
    img {
      object-position: 50% 62%;
    }
  }

  @include respond(hd) {
    height: 45rem;
    img {
      object-position: 50% 65%;
    }
  }

  @include respond(fullhd) {
    height: 65rem;
    img {
      object-position: 50% 65%;
    }
  }

  @include respond(qhd) {
    height: 88rem;
    img {
      object-position: 50% 68%;
    }
  }

  @include respond(4k) {
    height: 90rem;
    img {
      object-position: 50% 70%;
    }
  }
}
</style>