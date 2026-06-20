# TransportMR — Guide de démarrage rapide

## Prérequis
- Node.js 20+
- PostgreSQL 15+
- Docker (optionnel)

## Démarrage en développement

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
Le fichier `.env.local` est déjà créé. Modifiez `DATABASE_URL` selon votre configuration PostgreSQL.

### 3. Lancer PostgreSQL avec Docker (recommandé)
```bash
docker run -d \
  --name transport_mr_db \
  -e POSTGRES_USER=transport_user \
  -e POSTGRES_PASSWORD=transport_secure_pass_2024 \
  -e POSTGRES_DB=transport_mr \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Appliquer le schéma de base de données
```bash
npm run db:push
```

### 5. Alimenter avec les données de démonstration
```bash
npm run db:seed
```

### 6. Lancer l'application
```bash
npm run dev
```

Ouvrir http://localhost:3000

## Comptes de démonstration

| Rôle             | Email                   | Mot de passe |
|-----------------|-------------------------|--------------|
| Super Admin      | superadmin@demo.mr      | demo123      |
| Directeur        | directeur@demo.mr       | demo123      |
| Resp. Agence     | manager@demo.mr         | demo123      |
| Guichetier       | agent@demo.mr           | demo123      |
| Caissier         | caissier@demo.mr        | demo123      |
| Contrôleur       | controleur@demo.mr      | demo123      |
| Chauffeur        | chauffeur@demo.mr       | demo123      |

## Démarrage avec Docker (production)
```bash
docker-compose up -d
```

## Commandes utiles
```bash
npm run db:studio    # Prisma Studio (interface admin BDD)
npm run db:migrate   # Créer une migration
npm run db:reset     # Reset + re-seed
npm run build        # Build de production
```

## Structure du projet
```
src/
├── app/
│   ├── (auth)/login/          # Page de connexion
│   ├── (dashboard)/
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── reservations/      # Réservations
│   │   ├── passengers/        # Voyageurs
│   │   ├── trips/             # Trajets
│   │   ├── boarding/          # Embarquement
│   │   ├── parcels/           # Colis
│   │   ├── baggage/           # Bagages
│   │   ├── buses/             # Parc de bus
│   │   ├── finance/           # Finances
│   │   ├── reports/           # Rapports
│   │   ├── agencies/          # Agences
│   │   ├── users/             # Utilisateurs
│   │   └── settings/          # Paramètres
│   └── api/auth/              # NextAuth API
├── components/
│   ├── ui/                    # Composants UI de base
│   ├── layout/                # Sidebar, Header, Command Palette
│   ├── dashboard/             # Charts, Activity, Trips
│   └── shared/                # StatCard, DataTable
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── prisma.ts              # Client Prisma
│   ├── utils.ts               # Utilitaires
│   └── permissions.ts         # RBAC
├── actions/                   # Server Actions
└── types/                     # Types TypeScript
```
