# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir
- Système de templates de factures personnalisables
- Envoi de factures par email
- Gestion des devis
- Support multi-utilisateurs

## [1.0.2-alpha] - 2025-01-30

### Ajouté
- Fonctionnalité d'impression native avec aperçu système
- Export PDF des factures individuelles
- Export PDF groupé pour plusieurs factures
- Logo d'entreprise sur les factures imprimées
- Gestion automatique des migrations de base de données
- Système de mise à jour automatique via GitHub Releases
- Indicateur de connexion au backend
- Messages de toast pour feedback utilisateur

### Modifié
- Amélioration de la gestion des erreurs backend
- Optimisation du chargement des données
- Interface utilisateur plus responsive
- Meilleure validation des formulaires

### Corrigé
- Problème d'affichage des factures vides
- Erreur lors de la création de facture sans client/produit
- Bug de calcul du total des factures
- Problème de persistance du thème sombre
- Crash lors de l'impression sans imprimante connectée

## [1.0.1-alpha] - 2025-01-15

### Ajouté
- Gestion complète des clients (CRUD)
- Gestion des produits avec stock
- Création et modification de factures
- Tableau de bord avec statistiques
- Graphiques de performance (PieChart)
- Système d'authentification JWT
- Mode sombre/clair
- Base de données SQLite locale

### Modifié
- Migration vers Drizzle ORM
- Amélioration de l'architecture backend
- Refonte de l'interface avec TailwindCSS
- Optimisation des performances

### Corrigé
- Problèmes de synchronisation des données
- Erreurs de validation des formulaires
- Bugs d'affichage sur petits écrans

## [1.0.0-alpha] - 2025-01-01

### Ajouté
- Version initiale de PaintMS
- Interface de base avec Material-UI
- Gestion basique des factures
- Authentification simple
- Base de données locale

---

## Types de changements

- `Ajouté` pour les nouvelles fonctionnalités
- `Modifié` pour les changements aux fonctionnalités existantes
- `Obsolète` pour les fonctionnalités bientôt supprimées
- `Supprimé` pour les fonctionnalités supprimées
- `Corrigé` pour les corrections de bugs
- `Sécurité` pour les vulnérabilités corrigées