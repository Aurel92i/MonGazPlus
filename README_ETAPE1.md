# MonGaz+ - Étape 1 : Structure & Authentification

## 📱 Description

Application mobile React Native/Expo pour la **Vérification d'Étanchéité Apparente (VEA)** des installations gaz.

Deux profils utilisateur :
- **👷 Technicien** : Accès professionnel complet avec export PDF, signature client, géolocalisation
- **🏠 Particulier** : Interface simplifiée pour vérification personnelle

---

## 🚀 Installation

### Prérequis
- Node.js 18+ installé
- Expo Go sur votre téléphone (iOS ou Android)

### Commandes PowerShell

```powershell
# 1. Aller dans le dossier du projet
cd C:\Users\Admin\projets\MonGazPlus

# 2. Initialiser le projet Expo (dans le dossier existant)
npx create-expo-app@latest . --template blank-typescript

# 3. Installer les dépendances Expo
npx expo install expo-router expo-camera expo-sensors expo-image-picker expo-file-system expo-sqlite expo-crypto expo-secure-store @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens react-native-gesture-handler

# 4. Installer les autres dépendances
npm install zustand date-fns uuid
npm install -D @types/uuid

# 5. Lancer l'application
npx expo start
```

### ⚠️ Note importante

Après l'initialisation Expo, **remplacez les fichiers générés** par ceux de cette archive :
- Remplacez `app.json` et `tsconfig.json` à la racine
- Copiez les dossiers `app/`, `types/`, `stores/`, `constants/`

---

## 📁 Structure des fichiers

```
MonGazPlus/
├── app.json                    # Config Expo
├── tsconfig.json               # Config TypeScript
├── babel.config.js             # Config Babel
│
├── app/                        # Navigation Expo Router
│   ├── _layout.tsx             # Layout racine
│   ├── index.tsx               # Redirection selon auth
│   ├── login.tsx               # Écran de connexion
│   │
│   ├── (technicien)/           # Espace Technicien
│   │   ├── _layout.tsx         # Tabs technicien
│   │   ├── index.tsx           # Accueil (badge, stats)
│   │   ├── vea.tsx             # VEA avec infos client
│   │   ├── historique.tsx      # Export PDF, filtres
│   │   └── guides.tsx          # Documentation pro
│   │
│   ├── (particulier)/          # Espace Particulier
│   │   ├── _layout.tsx         # Tabs particulier
│   │   ├── index.tsx           # Accueil simplifié
│   │   ├── vea.tsx             # VEA simplifiée
│   │   ├── historique.tsx      # Historique basique
│   │   └── aide.tsx            # FAQ et contact
│   │
│   ├── capture/                # Écrans de capture (partagés)
│   │   ├── photo-avant.tsx     # Capture photo AVANT
│   │   └── photo-apres.tsx     # Timer + capture APRÈS
│   │
│   └── analyse/
│       └── resultat.tsx        # Verdict VEA
│
├── types/
│   ├── index.ts
│   ├── auth.types.ts           # User, Technicien, Particulier
│   └── vea.types.ts            # VEA, Intervention, etc.
│
├── stores/
│   ├── index.ts
│   ├── authStore.ts            # Zustand auth
│   └── veaStore.ts             # Zustand VEA
│
└── constants/
    ├── index.ts
    └── theme.ts                # Couleurs, styles
```

---

## 🔐 Authentification

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Technicien | `tech@grdf.fr` | `demo1234` |
| Particulier | `particulier@email.fr` | `demo1234` |

### Fonctionnement

1. L'utilisateur entre son **email** et **mot de passe**
2. Le backend (simulé) renvoie les infos utilisateur avec son **rôle**
3. L'app redirige vers l'espace approprié : `/(technicien)` ou `/(particulier)`

---

## 🎨 Thème et couleurs

### Couleurs par rôle
- **Technicien** : `#3B82F6` (bleu professionnel)
- **Particulier** : `#8B5CF6` (violet)

### Couleurs VEA
- **OK** : `#22C55E` (vert)
- **DOUTE** : `#F59E0B` (orange)
- **FUITE_PROBABLE** : `#EF4444` (rouge)

---

## ✅ Ce qui est inclus (Étape 1)

- [x] Structure Expo Router complète
- [x] Système d'authentification par email
- [x] Navigation conditionnelle selon le rôle
- [x] Écrans Technicien (accueil, VEA, historique, guides)
- [x] Écrans Particulier (accueil, VEA, historique, aide)
- [x] Écrans de capture (placeholders visuels)
- [x] Écran de résultat VEA
- [x] Types TypeScript complets
- [x] Stores Zustand (auth + VEA)
- [x] Thème cohérent

---

## 🔜 Prochaines étapes

### Étape 2 : Module Caméra & Stabilisation
- Accès caméra avec `expo-camera`
- Barre de stabilisation (accéléromètre/gyroscope)
- Cadre d'alignement intelligent
- Capture avec métadonnées

### Étape 3 : Mode Fantôme
- Overlay transparent de la photo AVANT
- Guides d'alignement précis

### Étape 4 : Analyse d'image
- Extraction zone décimale
- OCR embarqué (TensorFlow Lite)

### Étape 5 : Logique VEA
- Algorithme de comparaison
- Détection micro-oscillations

### Étape 6 : Stockage & Export
- SQLite local
- Export PDF
- Signature électronique

---

## 📞 Contact d'urgence gaz

**0 800 47 33 33** (gratuit 24h/24)

---

*MonGaz+ v1.0.0 - Étape 1*
