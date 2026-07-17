# Atlas des Brumes — SimGame

Atlas des Brumes est une démo de portfolio entièrement statique qui transforme une seed en carte d’exploration interactive. Le relief est généré avec du bruit de Perlin, réparti en sept biomes, puis peuplé de ressources cohérentes avec leur environnement.

Démo : [https://a52cents.github.io/SimGame/](https://a52cents.github.io/SimGame/)

## Fonctionnalités

- génération d’une nouvelle carte et d’une nouvelle seed à la demande ;
- sept biomes : eaux profondes, côtes, rivages, prairies, forêts, montagnes et neige ;
- placement déterministe du bois, de la pierre et de l’eau selon le biome ;
- navigation fluide à la souris, au tactile et au clavier ;
- zoom à la molette, par pincement ou avec les boutons dédiés ;
- popup de ressource accessible avec quantité et coordonnées ;
- légende et panneau explicatif adaptatifs ;
- interface responsive et respect de `prefers-reduced-motion` ;
- déploiement automatisé sur GitHub Pages.

## Contrôles

| Action | Souris / tactile | Clavier |
| --- | --- | --- |
| Se déplacer | Glisser sur la carte | Flèches directionnelles |
| Zoomer | Molette, pincement, boutons `+` / `−` | `+` / `−` |
| Vue initiale | Bouton « Vue initiale » | `0` ou `Home` |
| Inspecter une ressource | Clic ou toucher | `Entrée` au centre de la vue |
| Fermer une popup | Clic extérieur ou bouton « Fermer » | `Échap` |

## Choix techniques

Le terrain possède ses propres coordonnées monde (`1440 × 960`) et la caméra applique ensuite déplacement et zoom. Les ressources restent donc alignées avec le relief quelle que soit la vue.

Pour éviter le coûteux parcours de tous les pixels à chaque interaction, la génération produit une seule texture interne de `720 × 480` via le pixel buffer de p5.js avec `pixelDensity(1)`. Cette texture est mise à l’échelle et réutilisée tant que la seed ne change pas. Les panoramiques et zooms ne régénèrent jamais le bruit.

Le projet reste volontairement léger : React, p5.js et Vite, sans routeur, backend ni service externe.

## Installation locale

Prérequis : Node.js 20.19+ ou 22.12+ et npm.

```bash
git clone https://github.com/a52cents/SimGame.git
cd SimGame
npm ci
npm run dev
```

Vite indique l’URL locale, généralement [http://localhost:5173](http://localhost:5173).

## Vérifications

```bash
npm run lint
npm run build
npm run preview
```

La configuration Vite utilise la base `/SimGame/`. Les assets générés dans `dist` sont donc compatibles avec l’URL du dépôt GitHub Pages.

## Déploiement GitHub Pages

Le workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) se déclenche sur chaque push vers `main` ou manuellement. Il installe les dépendances avec `npm ci`, exécute le lint et le build, téléverse `dist`, puis effectue le déploiement Pages.

Après avoir poussé les fichiers :

1. ouvrir le dépôt GitHub, puis **Settings → Pages** ;
2. dans **Build and deployment**, choisir **GitHub Actions** comme source ;
3. ouvrir l’onglet **Actions** et attendre la réussite du workflow « Deploy to GitHub Pages » ;
4. accéder à [https://a52cents.github.io/SimGame/](https://a52cents.github.io/SimGame/).

Le site est statique : aucun secret ni backend n’est nécessaire.
