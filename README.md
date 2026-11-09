# Amine Moutaki — Portfolio

Portfolio React + TypeScript, Vite, Tailwind CSS, Framer Motion et Lucide React. Design reproduit à partir de `port/1.jpg`, conservé intact.

## Démarrer

```sh
npm install
npm run dev
```

Sous PowerShell avec scripts désactivés, utiliser `npm.cmd` à la place de `npm`.

```sh
npm run typecheck
npm run build
npm test
```

Les tests vérifient le build `dist/` et utilisent Google Chrome installé sur Windows, sans serveur ni réseau. Lancer `npm run build` avant les tests. Adapter `channel` dans `playwright.config.ts` pour un autre navigateur.

## Personnaliser

- `src/data/portfolio.ts` : identité, expérience, disponibilité et projets. Ajouter `email`, `cvUrl` et les `url` de projets uniquement avec leurs vraies valeurs.
- `src/assets/` : photo et aperçus extraits de la référence, sans modification du visage. Remplacer par les fichiers originaux pour une meilleure résolution.
- `src/index.css` : disposition, couleurs, responsive et animations. Les polices Google Fonts disposent d’un fallback monospace.

Le bouton CV signale son indisponibilité tant qu’aucun `cvUrl` n’est configuré. Les cartes ouvrent des aperçus accessibles au clavier. Le jeu dure 30 secondes, attribue 10 XP par bug et sauvegarde le record dans `localStorage`. Son désactivé par défaut, activable après interaction. Aucun backend ni lien de déploiement fictif.

## Developer Lab

Le Lab se trouve entre les projets et les logs système. L’éditeur TypeScript présente une démonstration animée avec pause et replay, suspendue hors écran. Avec la réduction des animations activée, le code complet est affiché immédiatement. Le code affiché n’est jamais exécuté.

Le terminal accepte `help`, `whoami`, `skills`, `projects`, `contact`, `clear`, `date`, `game` et `github`. Les flèches haut/bas parcourent l’historique. Les commandes cachées `sudo hire amine` et `matrix` déclenchent des animations locales. Aucun shell ni service externe n’est utilisé.

Les liens facultatifs se configurent dans `src/data/portfolio.ts` : `profile.githubUrl`, `profile.contactUrl`, `profile.email`, et `githubUrl` / `liveDemoUrl` sur chaque projet. L’ancien champ `project.url` reste pris en charge comme lien de démo. En leur absence, aucun lien externe n’est inventé. Les listes `features` reprennent les fonctionnalités déjà décrites pour chaque projet.

Les aperçus peuvent s’ouvrir par clic sur la carte, ses boutons, ou Entrée/Espace après sélection au clavier. Les modales se ferment par Échap, clic à l’extérieur ou bouton de fermeture, puis rendent le focus à leur déclencheur.
