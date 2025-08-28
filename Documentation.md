# Documentation Materialize - Cockpit

## Ajouter une entrée dans le menu

### Structure du système de menu

Le thème Materialize utilise un **menu en dur** (hardcodé) dans le composant React, PAS un fichier de configuration externe comme on pourrait le penser.

### Fichiers concernés

1. **Menu principal** : `src/components/layout/vertical/VerticalMenu.jsx`
2. **Traductions** : 
   - `src/data/dictionaries/en.json`
   - `src/data/dictionaries/fr.json` 
   - `src/data/dictionaries/ar.json`
3. **Pages** : `src/app/[lang]/(dashboard)/(private)/apps/[section]/[page]/page.jsx`

### Étapes pour ajouter une nouvelle entrée

#### 1. Ajouter les traductions

Dans `src/data/dictionaries/en.json` et `fr.json` :
```json
{
  "navigation": {
    "monNouveauMenu": "My New Menu",
    "sousMenu1": "Sub Menu 1"
  }
}
```

#### 2. Créer les pages Next.js

Structure de dossiers :
```
src/app/[lang]/(dashboard)/(private)/apps/
└── mon-nouveau-menu/
    └── sous-menu-1/
        └── page.jsx
```

#### 3. Modifier le composant VerticalMenu.jsx

Dans `src/components/layout/vertical/VerticalMenu.jsx`, localiser la section `<MenuSection label={dictionary['navigation'].appsPages}>` et ajouter :

```jsx
<SubMenu label={dictionary['navigation'].monNouveauMenu} icon={<i className='ri-folder-line' />}>
  <MenuItem href={`/${locale}/apps/mon-nouveau-menu/sous-menu-1`}>
    {dictionary['navigation'].sousMenu1}
  </MenuItem>
</SubMenu>
```

### Types d'entrées possibles

#### Menu simple (sans sous-menu)
```jsx
<MenuItem href={`/${locale}/apps/ma-page`} icon={<i className='ri-icon-name' />}>
  {dictionary['navigation'].maPage}
</MenuItem>
```

#### Menu avec sous-menus
```jsx
<SubMenu label={dictionary['navigation'].monMenu} icon={<i className='ri-icon-name' />}>
  <MenuItem href={`/${locale}/apps/mon-menu/page1`}>
    {dictionary['navigation'].page1}
  </MenuItem>
  <MenuItem href={`/${locale}/apps/mon-menu/page2`}>
    {dictionary['navigation'].page2}
  </MenuItem>
</SubMenu>
```

#### Section de menu
```jsx
<MenuSection label={dictionary['navigation'].maSection}>
  {/* Contenu de la section */}
</MenuSection>
```

### Icônes disponibles

Le thème utilise **RemixIcon** avec la classe `ri-*` :
- `ri-folder-line` : Dossier
- `ri-file-line` : Fichier  
- `ri-user-line` : Utilisateur
- `ri-settings-line` : Paramètres
- `ri-dashboard-line` : Tableau de bord

Voir la liste complète : https://remixicon.com/

### Pièges à éviter

1. **❌ Ne pas modifier** `src/data/navigation/verticalMenuData.jsx` - ce fichier n'est pas utilisé
2. **✅ Modifier** `src/components/layout/vertical/VerticalMenu.jsx` - c'est le menu réel
3. **✅ Redémarrer** le serveur après les modifications (`npm run dev`)
4. **✅ Vider le cache** du navigateur si les changements n'apparaissent pas

### Ordre des opérations recommandé

1. Créer les traductions
2. Créer les pages Next.js  
3. Ajouter l'entrée dans VerticalMenu.jsx
4. Redémarrer le serveur
5. Tester dans le navigateur

---

## Authentification

### Credentials de démonstration

- **Email:** `admin@materialize.com`
- **Password:** `admin`

### Configuration

L'authentification est configurée dans `src/libs/auth.js` avec NextAuth.js.

---

## Base de données

### Configuration Prisma

La base de données utilise **SQLite** avec **Prisma ORM**.

- **Schéma** : `src/prisma/schema.prisma`
- **Database** : `src/prisma/dev.db`
- **Migrations** : `src/prisma/migrations/`

### Modèles importés de Quotator

Le schéma inclut tous les modèles de l'application Quotator :

#### Modèles principaux
- **User** : Utilisateurs (compatible NextAuth + Quotator)
- **Project** : Projets avec statuts, étapes, chiffrage
- **Timeline** : Planning des projets par sections
- **Department** : Départements de l'entreprise
- **Resource** : Ressources (machines, véhicules, outils)
- **Role** : Rôles et niveaux d'autorisation

#### Système de chiffrage
- **Position** : Positions dans un devis
- **QuoteLine** : Lignes de chiffrage
- **PositionImage/Document** : Fichiers attachés

### Adaptations SQLite

SQLite ne supportant pas certains types :
- **JSON** → **String** (JSON sérialisé)
- **Enums** → **String** avec commentaires

### Commandes utiles

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Interface de gestion
npx prisma studio
```

---

*Cette documentation sera enrichie au fur et à mesure du développement.*