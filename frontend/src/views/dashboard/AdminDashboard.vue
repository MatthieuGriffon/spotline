<script setup lang="ts">
// Tu pourras plus tard injecter les vrais chiffres depuis un store ou l’API
const stats = {
  utilisateurs: { total: 128, bannis: 2 },
  prises: { total: 562, signalees: 7 },
  spots: { total: 302, masques: 4 },
  signalements: 11
}
</script>

<template>
<div class="admin-dashboard">
  <h2>Tableau de bord administrateur</h2>

  <div class="card" role="button" aria-label="Accéder à la gestion des utilisateurs">
    <div class="card-header">
      <font-awesome-icon icon="users" class="card-icon" />
      <div class="card-title">Utilisateurs ({{ stats.utilisateurs.total }})</div>
    </div>
    <div class="card-sub">Bannis : {{ stats.utilisateurs.bannis }}</div>
    <div class="card-action">Gérer les utilisateurs</div>
  </div>

  <div class="card" role="button" aria-label="Accéder à la gestion des prises">
    <div class="card-header">
      <font-awesome-icon icon="fish" class="card-icon" />
      <div class="card-title">Prises ({{ stats.prises.total }})</div>
    </div>
    <div class="card-sub">Signalées : {{ stats.prises.signalees }}</div>
    <div class="card-action">Gérer les prises</div>
  </div>

  <div class="card" role="button" aria-label="Accéder à la gestion des spots">
    <div class="card-header">
      <font-awesome-icon icon="map" class="card-icon" />
      <div class="card-title">Spots ({{ stats.spots.total }})</div>
    </div>
    <div class="card-sub">Masqués : {{ stats.spots.masques }}</div>
    <div class="card-action">Gérer les spots</div>
  </div>

  <div class="card" role="button" aria-label="Accéder à la liste des signalements à traiter">
    <div class="card-header">
      <font-awesome-icon icon="exclamation-triangle" class="card-icon" />
      <div class="card-title">Signalements</div>
    </div>
    <div class="card-sub">{{ stats.signalements }} à traiter</div>
    <div class="card-action">Voir les signalements</div>
  </div>

  <div class="card" role="button" aria-label="Accéder aux statistiques détaillées">
    <div class="card-header">
      <font-awesome-icon icon="chart-bar" class="card-icon" />
      <div class="card-title">Statistiques</div>
    </div>
    <div class="card-action">Voir les détails</div>
  </div>
</div>
</template>

<style scoped lang="scss">

.admin-dashboard {
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  gap: var(--space-xs);

  h2 {
    font-size: var(--font-lg);
    color: var(--color-text-inverted);
    margin-bottom: var(--space-xs);
    text-align: center;
    line-height: 1.2;
    font-weight: 600;

    &::after {
      content: '';
      display: block;
      margin: var(--space-sm) auto 0;
      width: 3rem;
      height: 0.25rem;
      background-color: var(--color-primary-dark);
      border-radius: var(--radius-md);
    }
  }
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md); // plus petit que lg
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-sm);
  box-shadow: var(--shadow-sm);
  transition: background 0.2s ease;

  &:active {
    background: var(--color-background-soft);
  }

  .card-title {
    font-weight: 600;
    font-size: var(--font-base); // réduit de lg → base
    color: var(--color-text);
    margin-bottom: var(--space-xs);
  }

  .card-sub {
    font-size: var(--font-xs); // plus petit
    color: var(--color-text-muted);
    margin-bottom: var(--space-xs);
  }

  .card-action {
  font-size: var(--font-xs);
  color: var(--color-primary);
  font-weight: 500;
  margin-top: var(--space-xs);
  text-decoration: underline;
}
}
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}
.card-icon {
  font-size: 1rem;
  color: var(--color-primary);
  flex-shrink: 0;
}
.card:hover {
  background: var(--color-background-soft);
  cursor: pointer;
}
</style>
