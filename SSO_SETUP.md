# Configuration SSO Keycloak

## Vue d'ensemble

Ce service d'authentification intègre Keycloak via le plugin SSO de Better Auth. Le provider SSO est enregistré automatiquement au démarrage de l'application.

## Architecture

### Structure des fichiers

```
src/
├── sso/
│   ├── sso.module.ts      # Module SSO
│   ├── sso.service.ts     # Service d'initialisation du provider
│   └── sso.controller.ts  # Endpoints SSO
└── lib/
    └── auth.ts            # Configuration Better Auth
```

### Fonctionnement

1. **Au démarrage** : Le `SsoService` implémente `OnModuleInit` et enregistre automatiquement le provider Keycloak dans MongoDB
2. **Collection MongoDB** : Les providers SSO sont stockés dans la collection `ssoProvider`
3. **Configuration** : Les paramètres Keycloak sont chargés depuis les variables d'environnement

## Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez les variables suivantes :

```bash
# Keycloak SSO Configuration
KEYCLOAK_ISSUER="http://localhost:8080/realms/gallis"
KEYCLOAK_DOMAIN="localhost:8080"
KEYCLOAK_CLIENT_ID="ecampus"
KEYCLOAK_CLIENT_SECRET="votre-secret-client"
KEYCLOAK_AUTH_ENDPOINT="http://localhost:8080/realms/gallis/protocol/openid-connect/auth"
KEYCLOAK_TOKEN_ENDPOINT="http://localhost:8080/realms/gallis/protocol/openid-connect/token"
KEYCLOAK_JWKS_ENDPOINT="http://localhost:8080/realms/gallis/protocol/openid-connect/certs"
KEYCLOAK_DISCOVERY_ENDPOINT="http://localhost:8080/realms/gallis/.well-known/openid-configuration"
```

### Configuration Keycloak

Dans votre realm Keycloak (`gallis`), configurez le client `ecampus` :

1. **Valid Redirect URIs** :
   - `http://localhost:3100/api/auth/sso/callback/keycloak-oidc`
   - `http://localhost:5173/*` (pour le frontend)

2. **Web Origins** :
   - `http://localhost:3100`
   - `http://localhost:5173`

3. **Client Authentication** : Activé
4. **Standard Flow** : Activé
5. **Direct Access Grants** : Activé (optionnel)

## Utilisation

### Démarrage de l'application

```bash
pnpm install
pnpm run start:dev
```

Au démarrage, vous verrez dans les logs :
```
✅ Provider SSO Keycloak initialisé avec succès
```

Ou si le provider existe déjà :
```
ℹ️ Provider SSO Keycloak déjà enregistré
```

### Endpoints disponibles

#### 1. Récupérer l'URL de connexion SSO

```bash
GET http://localhost:3100/sso/keycloak/signin-url
```

**Réponse** :
```json
{
  "url": "http://localhost:3100/api/auth/sso/sign-in?providerId=keycloak-oidc",
  "providerId": "keycloak-oidc"
}
```

#### 2. Connexion SSO (Better Auth)

```bash
GET http://localhost:3100/api/auth/sso/sign-in?providerId=keycloak-oidc
```

Cette URL redirige vers Keycloak pour l'authentification.

#### 3. Callback SSO (Better Auth)

```bash
GET http://localhost:3100/api/auth/sso/callback/keycloak-oidc
```

Endpoint de callback automatique après authentification Keycloak.

## Mapping des attributs

Les attributs OIDC de Keycloak sont mappés vers les champs utilisateur :

| Attribut OIDC | Champ utilisateur |
|---------------|-------------------|
| `sub` | `id` |
| `email` | `email` |
| `email_verified` | `emailVerified` |
| `name` | `name` |
| `picture` | `image` |
| `department` | `extraFields.department` |
| `role` | `extraFields.role` |

## Intégration Frontend

### Exemple avec React

```typescript
// Rediriger vers la page de connexion SSO
const handleSSOLogin = async () => {
  const response = await fetch('http://localhost:3100/sso/keycloak/signin-url');
  const { url } = await response.json();
  window.location.href = url;
};
```

### Exemple avec Better Auth Client

```typescript
import { createAuthClient } from 'better-auth/client';

const authClient = createAuthClient({
  baseURL: 'http://localhost:3100',
});

// Connexion SSO
await authClient.signIn.sso({
  providerId: 'keycloak-oidc',
  callbackURL: 'http://localhost:5173/dashboard',
});
```

## Vérification

### Vérifier le provider dans MongoDB

```bash
mongosh auth-service
db.ssoProvider.find({ providerId: 'keycloak-oidc' }).pretty()
```

### Tester la connexion

1. Accédez à : `http://localhost:3100/api/auth/sso/sign-in?providerId=keycloak-oidc`
2. Vous serez redirigé vers Keycloak
3. Connectez-vous avec vos identifiants Keycloak
4. Après authentification, vous serez redirigé vers votre application

## Dépannage

### Le provider n'est pas enregistré

- Vérifiez les logs au démarrage de l'application
- Vérifiez la connexion MongoDB
- Vérifiez les variables d'environnement

### Erreur de redirection

- Vérifiez que les **Valid Redirect URIs** dans Keycloak incluent l'URL de callback
- Format attendu : `http://localhost:3100/api/auth/sso/callback/keycloak-oidc`

### Erreur d'authentification

- Vérifiez le `clientId` et `clientSecret`
- Vérifiez que le client Keycloak a **Client Authentication** activé
- Vérifiez les endpoints Keycloak (issuer, auth, token, jwks)

## Sécurité

⚠️ **Important** :

- Ne commitez jamais le fichier `.env` avec les secrets réels
- Changez `KEYCLOAK_CLIENT_SECRET` en production
- Utilisez HTTPS en production
- Configurez les CORS correctement pour votre domaine de production
