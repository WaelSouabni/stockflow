# Facturation SaaS

**Statut : ⏸️ REPORTÉ**

## Objectif

Permettre aux entreprises clientes de payer leur abonnement StockFlow.

Ce système est distinct du paiement d'une facture émise par une entreprise à son propre client.

## Périmètre prévu

- Plans Free / Starter / Business
- Tarification mensuelle et éventuellement annuelle
- Page Pricing
- Création d'un client Stripe
- Stripe Checkout
- Stripe Subscription
- Webhooks Stripe
- Activation et synchronisation de l'abonnement
- Renouvellement
- Annulation
- Upgrade / downgrade
- Période d'essai éventuelle
- Portail client Stripe
- Historique de facturation SaaS
- Factures d'abonnement
- Limites par plan
- Gestion des abonnements expirés ou impayés

## Cycle prévu

Création entreprise → choix du plan → Checkout → webhook Stripe → activation de l'abonnement → application des limites → renouvellement / changement / annulation.

Les webhooks Stripe doivent être considérés comme la source de vérité pour l'état de l'abonnement.

## Modèle conceptuel prévu

Une entreprise devra être associée à un abonnement contenant notamment :
- plan
- statut
- stripeCustomerId
- stripeSubscriptionId
- période courante
- annulation en fin de période

Le modèle exact sera défini après la mise en place du multi-tenant.

## Prérequis

- [ ] Multi-tenant
- [ ] Isolation stricte des données
- [ ] Onboarding entreprise
- [ ] Permissions et sécurité durcies
- [ ] Environnement de production
- [ ] Politique tarifaire validée

## Décision

Ne pas commencer l'intégration Stripe SaaS avant que les prérequis ci-dessus soient suffisamment stabilisés.
