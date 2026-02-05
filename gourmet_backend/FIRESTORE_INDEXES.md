# 🔍 Firestore Indexes Configuration

## Vue d'ensemble
Firestore utilise automatiquement les indexes simple (single-field), mais certaines queries requièrent des indexes composites. Suivre ce guide pour créer manuellement les indexes dans Firebase Console.

## Collections & Index Recommandés

### 1. **Products Collection**

#### Index 1: Products by Category (Paginated)
```
Collection: products
Fields:
  - available (Ascending)
  - category (Ascending)
  - createdAt (Descending)
TTL: N/A
```
**Utilisé par**: `getProductsByCategory()`, `getProducts()` avec filtre

**Firebase Console Path**:
- Go to Firestore Database → Indexes (Composite)
- Create Index → products collection
- Add fields as above

#### Index 2: Popular Products
```
Collection: products
Fields:
  - available (Ascending)
  - popular (Ascending)
  - createdAt (Descending)
```
**Utilisé par**: `getPopularProducts()`

#### Index 3: Category & Availability
```
Collection: products
Fields:
  - category (Ascending)
  - available (Ascending)
  - createdAt (Descending)
```

### 2. **Orders Collection**

#### Index 1: User Orders (Paginated)
```
Collection: orders
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```
**Utilisé par**: `getUserOrders()`

#### Index 2: Orders by Status
```
Collection: orders
Fields:
  - status (Ascending)
  - createdAt (Descending)
```
**Utilisé par**: `getAllOrders()` avec filtre status

#### Index 3: User + Status (Advanced Filtering)
```
Collection: orders
Fields:
  - userId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
```
**Utilisé par**: Filtering orders by user + status

### 3. **Reservations Collection**

#### Index 1: User Reservations
```
Collection: reservations
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```
**Utilisé par**: `getUserReservations()`

#### Index 2: Availability Check
```
Collection: reservations
Fields:
  - date (Ascending)
  - time (Ascending)
  - status (Ascending)
```
**Utilisé par**: `createReservation()` availability check

#### Index 3: Date Range
```
Collection: reservations
Fields:
  - date (Ascending)
  - status (Ascending)
```

### 4. **Messages Collection**

#### Index 1: Unread Messages
```
Collection: messages
Fields:
  - read (Ascending)
  - createdAt (Descending)
```
**Utilisé par**: `getMessages()` avec `unread=true`

#### Index 2: Replied Status
```
Collection: messages
Fields:
  - replied (Ascending)
  - createdAt (Descending)
```

---

## 📊 Single Field Indexes (Automatic)

Firestore crée automatiquement les indexes single-field pour :
```
- products.name
- products.price
- products.category
- products.available
- products.createdAt
- orders.userId
- orders.status
- orders.total
- reservations.userId
- reservations.date
- messages.read
```

**✅ Ces indexes ne nécessitent PAS d'action manuelle**

---

## 🔧 Procédure de Configuration

### Via Firebase Console UI
1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Firestore Database → Indexes tab
4. Cliquez "Create Composite Index"
5. Sélectionnez collection
6. Ajoutez les fields dans l'ordre spécifié
7. Définissez Ascending/Descending
8. Cliquez Create

### Via Firebase CLI
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Déployer indexes
firebase deploy --only firestore:indexes
```

### Via firestore.indexes.json
```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "available", "order": "ASCENDING"},
        {"fieldPath": "category", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

---

## ⏱️ Temps de Création

- **Petit index**: ~1-2 minutes
- **Index moyen**: ~5-10 minutes
- **Index volumineux**: ~30 minutes+

Pendant la création, les queries utilisant cet index retourneront une erreur.

---

## ✅ Vérification

### Check Index Status
```bash
firebase firestore:indexes --display-format=json
```

### Expected Output
```json
{
  "indexes": {
    "product-category-index": {
      "state": "ENABLED",
      "fields": ["available", "category", "createdAt"]
    }
  }
}
```

---

## 🎯 Performance Impact

| Query Type | Sans Index | Avec Index |
|-----------|-----------|-----------|
| Filter + Order | ~500-1000ms | ~50-100ms |
| Multiple Filters | ~1000-2000ms | ~100-200ms |
| Large Result Set | ~2000+ms | ~300-500ms |

**Impact estimé**: -80% latence requêtes

---

## ⚠️ Troubleshooting

### Query Not Using Index
**Error**: `FAILED_PRECONDITION: The query requires an index...`
- ✅ Index n'existe pas → Créer l'index
- ✅ Index en création → Attendre quelques minutes
- ✅ Index désactivé → Réactiver dans Console

### Index Taking Too Long
- Peut arriver pour grandes collections
- Attendre ou vérifier le statut dans Firebase Console
- Pendant ce temps, queries retourneront erreur

### Wrong Query Plan
- Vérifier l'ordre des fields
- Vérifier Ascending/Descending
- Supprimer et recréer si besoin

---

## 📝 Checklist de Déploiement

- [ ] Créer Index 1: products (available, category, createdAt DESC)
- [ ] Créer Index 2: products (available, popular, createdAt DESC)
- [ ] Créer Index 1: orders (userId, createdAt DESC)
- [ ] Créer Index 2: orders (status, createdAt DESC)
- [ ] Créer Index 1: reservations (userId, createdAt DESC)
- [ ] Créer Index 2: reservations (date, time, status)
- [ ] Créer Index 1: messages (read, createdAt DESC)
- [ ] Vérifier tous les indexes en ENABLED state
- [ ] Tester queries en production
- [ ] Monitorer latence des requêtes

