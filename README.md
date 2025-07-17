# Spotline

**Spotline** est une application web collaborative pensée pour les passionné·e·s de pêche.  
Elle permet de créer des groupes, partager des prises géolocalisées, organiser des sessions, et découvrir de nouveaux spots sur carte.

---

## 🧱 Stack technique

### Frontend
- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia
- SCSS modulaire (`<style scoped lang="scss">`)
- Leaflet.js (carte interactive)

### Backend
- Fastify (TypeScript)
- Prisma (ORM PostgreSQL)
- TypeBox (validation)
- @fastify/session + @fastify/cookie (auth)
- @fastify/multipart + sharp (uploads)
- Resend (confirmation d'adresse email)

---

## 📦 Fonctionnalités principales (MVP)

- Authentification par sessions sécurisées (cookie httpOnly)
- Confirmation de l'adresse email (Resend)
- Gestion de groupes de pêche avec rôles (admin, membre, invité)
- Publication de prises (photo, espèce, matériel, description, date, carte)
- Sessions de pêche avec invitations et réponses
- Carte interactive filtrable (espèce, groupe, date, visibilité)
- Contrôle fin de la visibilité de chaque contenu (public, privé, groupes)

---

## 🚧 Structure du projet

```bash
spotline/
├── frontend/ # Application Vue 3
│ ├── src/
│ │ ├── api/
│ │ ├── store/
│ │ ├── views/
│ │ ├── components/
│ │ ├── router/
│ │ └── assets/styles/
│ └── ...
├── backend/ # Application Fastify
│ ├── src/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── routes/
│ │ ├── schemas/
│ │ ├── plugins/
│ │ ├── middlewares/
│ │ ├── types/
│ │ ├── utils/
│ │ └── server.ts
│ └── prisma/
│ ├── schema.prisma
├── .env.frontend
├── .env.backend
├── .gitignore
└── README.md
```
## 🚀 Lancement en local

### Prérequis
- Node.js 18+
- PostgreSQL en local
- Cloner le repo + configurer `.env.backend` et `.env.frontend`

### Installation
```bash
# À la racine du projet
npm install
npm run dev
```
Cela démarre à la fois :
le backend sur http://localhost:3000
le frontend sur http://localhost:5173

### Variables d'environnement
Créez deux fichiers `.env` à la racine du projet :

- `.env.frontend` pour le frontend
- `.env.backend` pour le backend

### Notes
Le projet est mobile-first, ergonomique et accessible (focus, contrastes, navigation tactile).

### Sécurité
Authentification par sessions server-side (pas de JWT)
Uploads redimensionnés, validés, et servis via endpoints protégés
Visibilité de chaque contenu vérifiée côté backend
Aucun accès aux contenus non autorisés même via l’API


