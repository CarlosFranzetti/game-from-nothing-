# Changelog

## v1.3 — level progression tuned to the arcade original

The curve was punishing in a way the arcade games never were: frightened time
hit **zero at level 7**, so power pellets became worthless barely a third of
the way in, and the whole pack chased you from the opening second of level 1.

- **Frightened time now follows the arcade table** (6/5/4/3/2, then relief
  levels at 6, 10, 14 and 19) and floors at one second instead of vanishing,
  so a four-ghost combo is always possible.
- **Speeds settle after level 5** at the arcade values rather than continuing
  to climb; ghosts stay at 95% of the player, so you are never simply outrun.
- **Classic staged ghost-house release.** Ghosts leave on pellet counters, not
  timers: level 1 opens with two ghosts out, the cyan one waiting for 30
  pellets and the orange one for 60. A stall guard frees the next ghost if the
  player stops eating, so the board can't deadlock.
- **Maze D rebuilt.** It had come out as a uniform lattice that read as
  machine-generated; it now has the varied block shapes of a designed arcade
  board while keeping its three tunnel pairs.

## v1.2 — maze redesign for playability

All four mazes rebuilt from scratch. The old layouts wasted the entire middle
third of the board on solid wall with a single corridor down each side and no
pellets — a dead zone you only entered to escape.

- **Pellets everywhere.** The middle band is now real playfield; pellet counts
  rose from ~250 to 320–356 per maze.
- **Three shafts per side around the ghost house** instead of one, joined by
  corridors above, through, and below it, so the middle is a set of loops with
  multiple escape routes instead of a funnel.
- **More tunnels, escalating by maze:** A has one pair, B and C have two, D has
  three (including full-width tunnel rows), so later boards give more outs.
- Tunnel rows are now **detected from the maze** rather than hard-coded to row
  14, so ghost tunnel slow-down applies on every tunnel.
- **Fruit timing and siren stages scale with each maze's pellet count**, so
  pacing feels identical on boards of different sizes.
- Layouts are now visually distinct from one another (varied block sizes, a
  dense grid maze for the late levels).

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
