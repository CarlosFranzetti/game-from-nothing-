# MS PACMANA Browser Prototype

This repository contains the original dependency-free browser prototype of MS PACMANA.
It uses vanilla JavaScript, Canvas, Web Audio, and a progressive web app shell.

> Project relationship: this prototype is preserved as a small, readable web
> implementation. Active React Native and Expo development lives in
> [Notmspacman](https://github.com/CarlosFranzetti/Notmspacman).

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the difference between the two repositories.

## Prototype features

- Four original maze layouts with rotating color schemes
- Four ghosts with different chase behaviors
- Power pellets and 200/400/800/1600 ghost-combo scoring
- Seven moving bonus fruits
- Side tunnels, ghost-house releases, and increasing difficulty
- Persistent local high score
- Synthesized Web Audio effects
- Touch, keyboard, and PWA support

## Controls

| Input | Action |
| --- | --- |
| Swipe or drag | Steer on touch devices |
| Arrow keys or WASD | Steer on desktop |
| Space or Enter | Start or pause |
| Tap | Start or resume |

## Run locally

There are no application dependencies and no build step.

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Project structure

- `index.html`: application shell
- `game.js`: game engine
- `sw.js`: offline cache
- `manifest.webmanifest` and `icons/`: installable PWA
- `vercel.json`: static deployment configuration

## Documentation

| File | Purpose |
| --- | --- |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Canonical project and repository relationship |
| [docs/GAMEPLAY.md](docs/GAMEPLAY.md) | Scoring, ghosts, fruit, and level behavior |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Maze format, movement, AI, audio, and rendering |
| [ROADMAP.md](ROADMAP.md) | Historical prototype roadmap |
| [CHANGELOG.md](CHANGELOG.md) | Prototype history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Local development and test checklist |

All artwork, layouts, and audio in this prototype are original creations.
