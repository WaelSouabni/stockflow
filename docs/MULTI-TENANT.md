# Multi-tenant

**Statut : 🔴 À implémenter**

## Objectif

Garantir qu'une entreprise ne puisse accéder qu'à ses propres données.

## Architecture cible

Company → Users / Products / Customers / Invoices / Stock / Settings

## Règle fondamentale

Toutes les lectures, créations, modifications et suppressions de données métier doivent être filtrées ou contrôlées par le contexte de l'entreprise authentifiée.

Une modification d'ID dans une requête ne doit jamais permettre d'accéder aux données d'une autre entreprise.

## À prévoir

- companyId sur les modèles concernés
- résolution de l'entreprise depuis la session
- contraintes et index Prisma
- isolation des Server Actions
- isolation des services
- tests d'accès inter-entreprises
- seed multi-tenant de test
