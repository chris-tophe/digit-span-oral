# Digit Span Oral - PWA

Une application web progressive (PWA) pour s'entraîner à la mémorisation de séries de chiffres à l'oral, utilisant la synthèse vocale (TTS) et la reconnaissance vocale (STT) du navigateur.

## 🎯 Fonctionnalités

- **Génération aléatoire** de séries de chiffres (0-9)
- **Longueur configurable** (3 à 12 chiffres)
- **Option de doublons** : autoriser ou non les chiffres répétés
- **3 modes de réponse** :
  - Ordre normal (répéter la séquence telle quelle)
  - Ordre inverse (répéter la séquence à l'envers)
  - Ordre croissant (répéter les chiffres dans l'ordre croissant)
- **Synthèse vocale (TTS)** pour annoncer les chiffres
- **Reconnaissance vocale (STT)** pour saisir les réponses à l'oral
- **Saisie manuelle** également disponible
- **Suivi des résultats** avec historique et taux de réussite
- **Installable** comme PWA sur mobile et desktop

## 📱 Installation

### Comme PWA
1. Ouvrez l'application dans un navigateur compatible (Chrome, Edge, Firefox)
2. Cliquez sur "Installer" ou "Ajouter à l'écran d'accueil" dans le menu du navigateur
3. L'application s'ouvrira comme une application native

### Déploiement local
1. Clonez ce dépôt
2. Ouvrez `index.html` dans un navigateur
3. Autorisez l'accès au microphone quand demandé

## 🚀 Déploiement sur Vercel

1. Poussez ce dépôt sur votre compte GitHub
2. Connectez-vous à [Vercel](https://vercel.com)
3. Importez le dépôt GitHub
4. Vercel détectera automatiquement la configuration et déploiera l'application

## 🛠 Configuration

### Paramètres disponibles
- **Longueur de la série** : Nombre de chiffres dans la séquence (3-12)
- **Autoriser les doublons** : Si activé, les chiffres peuvent apparaître plusieurs fois

### Modes de réponse
- **Ordre normal** : Répéter la séquence dans l'ordre original
- **Ordre inverse** : Répéter la séquence à l'envers
- **Ordre croissant** : Répéter les chiffres triés par ordre croissant

## 🎨 Technologie

- **HTML5** pour la structure
- **CSS3** pour le style et les animations
- **JavaScript** (ES6+) pour la logique
- **Web Speech API** pour TTS et STT
- **PWA** avec service worker et manifest

## 🔒 Compatibilité

### Navigateurs supportés
- ✅ Google Chrome (recommandé)
- ✅ Microsoft Edge
- ⚠️ Firefox (TTS supporté, STT limité)
- ❌ Safari (support partiel)

### Appareils
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (Android, iOS avec limitations)

## 📦 Structure du projet

```
digit-span-oral/
├── index.html          # Page principale
├── app.js             # Logique de l'application
├── styles.css         # Styles CSS
├── manifest.json      # Manifest pour PWA
├── vercel.json        # Configuration Vercel
├── icons/             # Icônes de l'application
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   └── ...
└── README.md          # Documentation
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Projet privé - Tous droits réservés.
