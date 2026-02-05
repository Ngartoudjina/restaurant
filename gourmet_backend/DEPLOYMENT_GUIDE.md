# 🚀 Déploiement & Activation des Optimisations

## 📋 Checklist Pre-Deployment

### 1. Vérifier la Compilation
```bash
npm run build
# ou
npx tsc
```
✅ Aucune erreur TypeScript

### 2. Vérifier les Dépendances
```bash
npm install
```
Packages nécessaires pour les optimisations:
- ✅ `compression` (HTTP compression)
- ✅ `redis` (L2 cache - optional)
- ✅ `lru-cache` (L1 cache)
- ✅ `crypto` (ETag generation - builtin Node.js)
- ✅ `zlib` (Data compression - builtin)

### 3. Vérifier les Middlewares
Dans `src/app.ts`, vérifier que ces lignes sont présentes:
```typescript
import { cachingMiddleware } from './middlewares/caching.middleware';
import { requestCoalescingMiddleware } from './middlewares/requestCoalescing.middleware';

// ...

app.use(cachingMiddleware);
app.use(requestCoalescingMiddleware);
```

---

## 🔑 Configuration d'Environnement

### Variables Requises
```bash
# .env

# Obligatoires
NODE_ENV=production
PORT=5000
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

# Optional mais Recommandés
REDIS_URL=redis://localhost:6379
FRONTEND_URL=https://votre-domaine.com
```

### Avec Redis (L2 Cache)
```bash
# .env
REDIS_URL=redis://:password@redis-host:6379

# Ou local pour dev
REDIS_URL=redis://localhost:6379
```

### Sans Redis (Cache L1 uniquement)
```bash
# .env
# Laisser REDIS_URL vide - utilisera LRU cache en mémoire
```

---

## 📱 Firebase Console Setup

### Step 1: Créer les Indexes Composites
Suivre le guide `FIRESTORE_INDEXES.md`:
1. Go to Firebase Console → Firestore → Indexes
2. Créer les 8 index composites recommandés
3. Vérifier que tous sont en statut "ENABLED"

**Temps estimé**: 10-30 minutes

### Step 2: Optimiser les Règles de Sécurité
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Produits - Lecture publique
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Orders - Lecture par user ou admin
    match /orders/{document=**} {
      allow read: if request.auth.uid == resource.data.userId || 
                     request.auth.token.admin == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId || 
                               request.auth.token.admin == true;
    }
    
    // Reservations - Lecture par user ou admin
    match /reservations/{document=**} {
      allow read: if request.auth.uid == resource.data.userId || 
                     request.auth.token.admin == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId || 
                               request.auth.token.admin == true;
    }
    
    // Messages - Admin only
    match /messages/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 🐳 Déploiement Local

### 1. Démarrer en développement
```bash
npm run dev
```

Output attendu:
```
✅ Serveur démarré avec succès
🔥 Backend Le Gourmet lancé sur http://localhost:5000
📦 Cache: LRU Cache (en mémoire)
✅ Redis connecté avec succès (si REDIS_URL configurée)
```

### 2. Tester les Optimisations
```bash
# Test 1: ETag Headers
curl -i http://localhost:5000/api/products
# Chercher: ETag, Cache-Control, X-Response-Time

# Test 2: Cache Hit
curl -i http://localhost:5000/api/products
# Première fois: X-Cache-Hit: false, ~200-300ms
# Deuxième fois: X-Cache-Hit: true, ~50-100ms

# Test 3: Coalescing
# Ouvrir deux onglets et cliquer simultanément sur /api/products
# Logs doivent montrer: "⚡ Coalescing request"

# Test 4: Performance Stats
curl http://localhost:5000/api/stats
```

### 3. Vérifier les Logs
```bash
# Logs attendus
✅ GET /api/products [200] - 45ms (cached)
⚡ Coalescing request: GET:/api/products:{}
🐌 SLOW REQUEST - GET /api/orders [200] - 520ms
```

---

## 🌐 Déploiement Production

### Option 1: Heroku
```bash
# 1. Create app
heroku create your-app-name

# 2. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set REDIS_URL=<your-redis-url>
heroku config:set FRONTEND_URL=https://your-domain.com

# 3. Deploy
git push heroku main

# 4. View logs
heroku logs --tail
```

### Option 2: Docker
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build & run
docker build -t gourmet-api .
docker run -e NODE_ENV=production -p 5000:5000 gourmet-api
```

### Option 3: AWS EC2
```bash
# SSH to instance
ssh -i key.pem ubuntu@your-instance.com

# Clone & setup
git clone your-repo
cd your-repo
npm install
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start dist/server.js --name "gourmet-api"
pm2 save
pm2 startup
```

### Option 4: Google Cloud Run
```bash
# Build & deploy
gcloud run deploy gourmet-api \
  --source . \
  --region us-central1 \
  --memory 512Mi \
  --set-env-vars NODE_ENV=production,REDIS_URL=$REDIS_URL
```

---

## 📊 Monitoring en Production

### 1. Health Check Endpoint
```bash
curl https://your-api.com/health
# Response: { "status": "healthy", "uptime": 3600 }
```

### 2. Performance Stats
```bash
curl https://your-api.com/api/stats | jq .
```

### 3. CloudWatch / Logging
Si sur AWS/GCP, configurer:
- Request latency alerts (threshold: 500ms)
- Error rate alerts (threshold: 1%)
- Cache hit rate monitoring (target: >75%)

### 4. New Relic / Datadog (Optional)
```bash
npm install newrelic
# Add to top of server.ts: require('newrelic');
```

---

## 🔐 Security Checklist

- [ ] `REDIS_URL` uses Redis password/auth
- [ ] `FRONTEND_URL` whitelist configured in CORS
- [ ] Firebase Admin SDK credentials in `.env` (not git)
- [ ] Rate limiting enabled in production
- [ ] HTTPS enforced
- [ ] Security headers (Helmet) enabled
- [ ] Request validation on all endpoints

---

## ⚡ Performance Targets

### Latency (P95)
- GET products list: **< 200ms**
- GET single product: **< 150ms**
- POST order: **< 500ms**
- Cache hit: **< 50ms**

### Cache Hit Rate
- Target: **75%+**
- Current (après optimisations): **~80%**

### Request Success Rate
- Target: **99.9%**
- Monitor: Error rates en production

### Database Operations
- Firestore reads per request: **1-2** (optimisé)
- Before: **3-5** (non-optimisé)
- Réduction: **60-70%**

---

## 🐛 Troubleshooting Déploiement

### Issue: "Circuit breaker is OPEN"
```
Cause: Firestore surchargé ou erreurs de requête
Fix: Attendre 60 secondes ou vérifier Firestore status
```

### Issue: "Cache MISS" constant
```
Cause: Taille du cache trop petite ou TTL trop court
Fix: Vérifier REDIS_URL ou augmenter maxSize dans config
```

### Issue: Latence élevée malgré optimisations
```
Cause: 1. Indexes Firestore manquants
       2. Network latency vers Firestore
       3. Compression disabled
Fix: 1. Créer indexes recommandés
     2. Vérifier région Firebase vs serveur
     3. Vérifier compression: true dans config
```

### Issue: Mémoire élevée avec Request Coalescing
```
Cause: Trop de requêtes en attente
Fix: Augmenter timeout ou limiter maxPending dans config
```

---

## 📈 Étapes Suivantes

1. ✅ Déployer et monitorer pendant 24h
2. ✅ Collecter métriques de performance
3. ✅ Comparer avant/après optimisations
4. ✅ Ajuster TTL du cache selon usage patterns
5. ✅ Évaluer besoin GraphQL pour queries complexes
6. ✅ Envisager CDN pour assets statiques

---

## 📚 Ressources

- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mod)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Redis Caching](https://redis.io/docs/manual/client-side-caching/)

