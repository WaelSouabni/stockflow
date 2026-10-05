# Sécurité

**Statut : 🟠 Audit à réaliser**

## Points à vérifier

- Autorisation serveur sur toutes les Server Actions
- Validation Zod des entrées
- Isolation multi-tenant
- AUTH_SECRET obligatoire en production
- Cookies sécurisés en production
- Expiration et invalidation de session
- Rate limiting du login
- Protection CSRF selon les flux concernés
- Contrôle d'accès par rôle
- Protection contre l'accès direct par ID
- Gestion des erreurs sans fuite d'informations sensibles
- Secrets uniquement via variables d'environnement

## Objectif

Les contrôles de sécurité doivent être effectués côté serveur et ne jamais dépendre uniquement de l'interface.
