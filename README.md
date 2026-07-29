# MS PACMANA

An original arcade-style maze-chase game built specifically for iPhone — a loving
homage to the golden age of arcade games, with original maze layouts, hand-rasterized
pixel sprites, and fully synthesized retro sound.

**Play it:** deploy target `msppmacmana.vercel.app`

## iPhone experience

- **No browser chrome**: open it in Safari, tap **Share → Add to Home Screen**, and
  launch it from the icon — it runs fullscreen as a standalone app (PWA, works offline).
- **Swipe anywhere to steer** — you don't have to touch the character; you can even
  hold your thumb down and slide to chain turns.
- Retro sounds are synthesized live with WebAudio (sirens, waka, power-ups, and a
  ready jingle) — audio unlocks on your first tap.

## Game features

- 4 original maze layouts with distinct color schemes that rotate as you level up
- 4 ghosts with distinct personalities (direct chaser, ambusher, flanker, and a shy one),
  scatter/chase waves, frightened mode with flashing, and eyes that path-find home
- Power pellets, 200/400/800/1600 ghost combo scoring, popup score text
- Moving bonus fruit (7 kinds by level) that wanders in through the tunnels
- Side tunnels with wraparound and ghost slow-down, ghost house with timed releases
- Increasing difficulty per level (speeds up, frightened time shrinks)
- Lives, extra life at 10,000 points, persistent local high score
- Authentic 224×288 internal resolution with pixel-perfect upscaling

## Controls

| Input | Action |
|---|---|
| Swipe / drag (touch) | steer |
| Arrow keys / WASD | steer (desktop) |
| Space / Enter | start · pause |
| Tap | start · resume |

## Development

Pure vanilla JS + canvas, zero dependencies, no build step:

```
python3 -m http.server 8000   # then open http://localhost:8000
```

Files: `index.html` (shell), `game.js` (engine), `sw.js` (offline cache),
`manifest.webmanifest` + `icons/` (home-screen app).

*All artwork, layouts, and audio are original creations.*
