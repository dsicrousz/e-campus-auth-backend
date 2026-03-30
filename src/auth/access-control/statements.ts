import { defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Définition des ressources et actions disponibles
 * Basé sur Better Auth Access Control
 */
export const statement = {
  ...defaultStatements, // user, session permissions par défaut
  // Ressources métier personnalisées
  vente: ['create', 'read', 'update', 'delete', 'list', 'validate'],
  caisse: ['open', 'close', 'read', 'reconcile', 'list'],
  restaurant: ['manage', 'read', 'update', 'list'],
  codification: ['create', 'read', 'update', 'delete', 'list'],
  sport: ['manage', 'read', 'update', 'list'],
  recouvrement: ['create', 'read', 'update', 'list', 'validate'],
  reprise: ['create', 'read', 'update', 'list', 'validate'],
  controle: ['read', 'validate', 'reject', 'list'],
  rapport: ['generate', 'read', 'export', 'list'],
} as const;
