# Ecosystem Simulation

Ecosystem Simulation est un projet utilisant **React**, **p5.js** et **Vite** pour générer un terrain procédural avec différents types de ressources. Le terrain est généré à l'aide du bruit de Perlin, offrant une carte unique à chaque lancement. Des ressources telles que du bois, de la pierre et de l'eau sont automatiquement placées en fonction de leur environnement sur la carte.

## Fonctionnalités

- **Génération de terrain procédurale** : Utilisation du bruit de Perlin pour créer des cartes avec des biomes variés (eau, sable, herbe, montagnes, neige).
- **Placement des ressources** : Les ressources sont placées automatiquement :
  - Le bois est placé sur les zones herbeuses.
  - La pierre sur les montagnes.
  - L'eau près des étendues d'eau.
- **Rendu dynamique** : Le terrain et les ressources sont rendus de manière dynamique grâce à **p5.js**.

## Installation

### Prérequis

- **Node.js** (v14 ou supérieur)
- **npm** ou **yarn**

### Étapes

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/your-username/your-repository.git

2. Allez dans le dossier du projet :

    ```bash
    cd your-repository

3. Installez les dependances :

     ```bash
     npm install

4. Lancez l'application en mode développement :

     ```bash
     npm run dev

Ouvrez [http://localhost:3000](http://localhost:5173) pour voir l'application dans votre navigateur.

## Technologies Utilisées

- **React** : Librairie pour construire l'interface utilisateur.
- **Vite** : Outil de build rapide pour le développement moderne.
- **p5.js** : Librairie JavaScript pour le rendu créatif du terrain et des ressources.
- **Bruit de Perlin** : Utilisé pour la génération procédurale du terrain.

## Améliorations Futures

- Ajouter de nouveaux types de ressources et de terrains.
- Implémenter le zoom et le déplacement de la carte.
- Ajouter de l'interactivité sur les ressources.
