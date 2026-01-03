# MonGaz+ - Étape 3 : Analyse par Pixels

## 📋 Vue d'ensemble

L'étape 3 implémente un système d'analyse d'images **100% offline** pour détecter les micro-oscillations du compteur gaz.

### Pipeline d'analyse

```
Photo AVANT + Photo APRÈS
         ↓
┌─────────────────────────────────┐
│ 1. Crop zone décimale           │ ← expo-image-manipulator
│    (3 derniers chiffres)        │
│    Position: 55-95% largeur     │
│             35-65% hauteur      │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 2. Redimensionnement            │
│    200x100 pixels               │
│    Format JPEG 80%              │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 3. Comparaison pixels           │
│    - Échantillonnage 5000 pts   │
│    - Calcul différence          │
│    - Détection mouvement        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 4. Génération verdict           │
│    OK / DOUTE / FUITE_PROBABLE  │
└─────────────────────────────────┘
```

## 📁 Architecture des fichiers

```
lib/
├── index.ts                      # Exports publics
└── analysis/
    ├── veaAnalysis.ts            # Service principal (API publique)
    ├── imageProcessing.ts        # Crop et préparation images
    └── pixelComparison.ts        # Comparaison pixel par pixel
```

## 🔧 Modules

### 1. imageProcessing.ts

**Fonctionnalités :**
- `cropDecimalZone()` - Crop la zone des 3 derniers chiffres
- `prepareImageForComparison()` - Redimensionne à taille standard
- `processImageForAnalysis()` - Pipeline complet

**Configuration zone décimale :**
```typescript
const DECIMAL_ZONE_CONFIG = {
  startX: 0.55,  // 55% depuis la gauche
  endX: 0.95,    // 95% de la largeur
  startY: 0.35,  // 35% depuis le haut
  endY: 0.65,    // 65% de la hauteur
};
```

### 2. pixelComparison.ts

**Fonctionnalités :**
- `compareBase64Images()` - Compare deux images base64
- `compareProcessedImages()` - Compare deux ProcessedImage
- `quickSimilarityCheck()` - Vérification rapide d'alignement

**Seuils de détection :**
```typescript
const THRESHOLDS = {
  PIXEL_CHANGE_THRESHOLD: 30,        // Différence par pixel (0-255)
  NO_MOVEMENT_PERCENT: 3,            // < 3% = OK
  MICRO_MOVEMENT_PERCENT: 8,         // 3-8% = DOUTE
  SIGNIFICANT_MOVEMENT_PERCENT: 15,  // > 8% = FUITE_PROBABLE
};
```

### 3. veaAnalysis.ts

**API publique :**
```typescript
// Analyse complète
performVEAAnalysis(imageBefore, imageAfter, elapsedTime): Promise<VEADecision>

// Mode simulation (test)
performMockVEAAnalysis(elapsedTime): VEADecision

// Vérification alignement
checkImageAlignment(imageBefore, imageAfter): Promise<{isAligned, quality}>
```

## 📊 Résultats possibles

| Résultat | Pixels changés | Couleur | Action |
|----------|----------------|---------|--------|
| `OK` | < 3% | 🟢 Vert | Remise en service |
| `DOUTE` | 3-8% | 🟠 Orange | Refaire le test |
| `FUITE_PROBABLE` | > 8% | 🔴 Rouge | Contacter pro |

## ⚙️ Dépendances

```json
{
  "expo-image-manipulator": "~14.0.8",
  "expo-file-system": "~19.0.21"
}
```

## 🚀 Installation

```bash
cd MonGazPlus
npm install
npx expo start --clear
```

## 📝 Logs de debug

L'analyse génère des logs détaillés :

```
═══════════════════════════════════════
🔍 DÉBUT ANALYSE VEA - Étape 3
═══════════════════════════════════════
⏱️ Temps écoulé: 185s
📷 Image AVANT: file://...
📷 Image APRÈS: file://...

📐 Étape 1: Traitement des images...
📏 Dimensions image: 4032x3024
✂️ Zone de crop: x=2217, y=1058, w=1612, h=907
✅ Crop réussi: 1612x907
✅ Image préparée: 200x100

🔬 Étape 2: Comparaison des zones décimales...
📊 Taille avant: 12450, après: 12380
📈 Échantillons: 5000 vs 5000
✅ Résultat: none, confiance: 92.3%

📋 Étape 3: Génération du verdict...

═══════════════════════════════════════
✅ VERDICT: OK
📊 Confiance: 95.3%
🎨 Code couleur: green
📈 Pixels changés: 1.45%
🔗 Similarité: 98.5%
═══════════════════════════════════════
```

## 🔮 Évolutions futures (Étape 3+)

- **ML Kit OCR** : Lecture réelle des chiffres (nécessite build natif)
- **TensorFlow Lite** : Modèle custom pour compteurs gaz
- **Amélioration zone** : Détection automatique de la position des chiffres
