# PaintMS - Logiciel de Gestion pour Entreprises de Peinture

![Version](https://img.shields.io/badge/version-1.0.2--alpha-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

Application de bureau complète pour la gestion des factures, clients et produits destinée aux entreprises de peinture et de services.

## Fonctionnalités

### Gestion des Factures
- Création et modification de factures/bons
- Numérotation automatique des factures
- Suivi des paiements (payé/non payé)
- Impression des factures avec modèle professionnel
- Export en PDF
- Impression groupée de plusieurs factures

### Gestion des Clients
- Base de données complète des clients
- Informations de contact détaillées
- Historique des factures par client
- Recherche et filtrage rapide

### Gestion des Produits
- Catalogue de produits avec prix
- Gestion des quantités en stock
- Catégorisation des produits
- Mise à jour des prix en masse

### Tableau de Bord
- Vue d'ensemble des statistiques
- Total des factures payées/non payées
- Graphiques de performance
- Indicateurs clés de performance (KPI)

### Sécurité
- Authentification utilisateur
- Stockage local sécurisé des données
- Migrations de base de données automatiques
- Sauvegarde des données

## Technologies Utilisées

- **Frontend**: React 19, TailwindCSS, Material-UI, Recharts
- **Backend**: Express.js, Drizzle ORM
- **Base de données**: SQLite (libSQL)
- **Desktop**: Electron 38
- **Build**: Vite, electron-vite, electron-builder
- **Authentification**: JWT (JSON Web Tokens)

## Prérequis

- Node.js 18 ou supérieur
- pnpm (gestionnaire de paquets)
- Windows 10/11, macOS 10.15+, ou Linux

## Installation pour le Développement

1. Cloner le dépôt:
```bash
git clone https://github.com/berkaouibilalXI/PaintMS-vite-elec.git
cd PaintMS-vite-elec
```

2. Installer les dépendances:
```bash
pnpm install
```

3. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

Modifier `.env` selon vos besoins:
```env
M_VITE_SEED=true
M_VITE_DATABASE_URL=file:sqlite.db
M_VITE_PORT=3001
M_VITE_JWT_SECRET=your-secret-key
```

4. Générer les migrations de base de données:
```bash
pnpm db:generate
```

5. Lancer l'application en mode développement:
```bash
pnpm dev
```

## Build de Production

### Windows
```bash
pnpm build:win
```

### macOS
```bash
pnpm build:mac
```

### Linux
```bash
pnpm build:linux
```

Les fichiers d'installation seront générés dans le dossier `release/`.

## Utilisation

### Première Connexion

Lors du premier lancement, un compte administrateur est créé automatiquement:

- **Username**: `adminms`
- **Password**: `admin123`
- **Email**: `admin@paintms.com`

**Important**: Changez le mot de passe après la première connexion.

### Workflow Typique

1. **Ajouter des clients** dans la section Clients
2. **Ajouter des produits** dans la section Produits
3. **Créer des factures** en associant clients et produits
4. **Imprimer ou exporter** les factures en PDF
5. **Marquer comme payé** une fois le paiement reçu

## Structure du Projet

```
PaintMS-vite-elec/
├── src/
│   ├── main/              # Processus principal Electron
│   │   ├── server/        # Backend Express
│   │   │   ├── controllers/
│   │   │   ├── drizzle/   # ORM et schémas
│   │   │   ├── middlewares/
│   │   │   └── routes/
│   │   └── index.js
│   ├── preload/           # Scripts preload
│   └── renderer/          # Interface React
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── services/
│           └── context/
├── resources/             # Icônes et assets
├── drizzle/              # Migrations de base de données
└── out/                  # Build de sortie
```

## Scripts Disponibles

- `pnpm dev` - Lance l'app en mode développement
- `pnpm build` - Build l'application
- `pnpm build:win` - Build pour Windows
- `pnpm build:mac` - Build pour macOS
- `pnpm build:linux` - Build pour Linux
- `pnpm db:generate` - Génère les migrations
- `pnpm db:studio` - Ouvre Drizzle Studio

## Configuration de la Base de Données

L'application utilise SQLite avec Drizzle ORM. Les données sont stockées localement:

- **Développement**: `sqlite.db` à la racine du projet
- **Production**: Dans le dossier AppData de l'utilisateur

### Migrations

Les migrations sont exécutées automatiquement au démarrage. Pour créer de nouvelles migrations:

```bash
pnpm db:generate
```

## Mise à Jour Automatique

L'application vérifie automatiquement les mises à jour via GitHub Releases toutes les 15 minutes.

Configuration dans `package.json`:
```json
"publish": {
  "provider": "github",
  "owner": "berkaouibilalXI",
  "repo": "PaintMS-vite-elec"
}
```

## Contribution

Les contributions sont les bienvenues! Pour contribuer:

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## Roadmap

- [ ] Système de templates de factures personnalisables
- [ ] Facturation récurrente
- [ ] Envoi de factures par email
- [ ] Rapports avancés et analytics
- [ ] Support multi-utilisateurs
- [ ] Synchronisation cloud (optionnelle)
- [ ] Application mobile compagnon
- [ ] Support de plusieurs devises
- [ ] Gestion des devis

## Support

Pour toute question ou problème:

- Ouvrir une issue sur GitHub
- Email: support@paintms.com

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

**Berkaoui Bilal**
- GitHub: [@berkaouibilalXI](https://github.com/berkaouibilalXI)

## Remerciements

- Electron pour le framework desktop
- React et l'écosystème moderne JavaScript
- La communauté open source

---

Développé avec soin pour les professionnels de la peinture 🎨