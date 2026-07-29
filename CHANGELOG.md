# Changelog

## v1.1 — sprite fit + docs

- Walls now pull back 2px from every corridor face, giving 12px visual channels;
  sprites shrunk to 13px (player) and 12x13 (ghosts) so **everything fits inside
  the maze corridors** with no wall clipping
- Fixed a wall edge-highlight typo on right-facing wall edges
- Service worker cache bumped to v2 so installed home-screen apps pick up the update
- Added full documentation set: `ROADMAP.md`, `CHANGELOG.md`,
  `docs/GAMEPLAY.md`, `docs/ARCHITECTURE.md`, `CONTRIBUTING.md`

## v1.0 — initial release

- Full arcade-style maze chase at authentic 224x288 internal resolution
- 4 original validated mazes (every pellet reachable, no dead ends) with
  distinct color schemes rotating across levels
- 4 ghosts with distinct AI personalities, scatter/chase waves, frightened
  mode with flashing, eyes that BFS path-find back to the ghost house
- Swipe-anywhere steering with chained swipes and corner-cutting
- Power pellets, 200/400/800/1600 ghost combos, moving bonus fruit (7 kinds),
  tunnels with ghost slow-down, timed house releases
- Fully synthesized WebAudio sound: sirens that rise as pellets deplete,
  waka alternation, power-up warble, death sweep, original ready jingle
- Lives, extra life at 10,000, persistent local high score
- iPhone PWA: fullscreen standalone display, offline service worker, icons
- Deployed on Vercel as a plain static site
