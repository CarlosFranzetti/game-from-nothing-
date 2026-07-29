# Architecture

Zero-dependency vanilla JS + a single canvas. No build step; every file ships
as authored.

```
index.html            iPhone fullscreen shell (viewport, PWA meta, CSS reset)
game.js               the whole game (~1100 lines)
sw.js                 service worker: network-first cache for offline play
manifest.webmanifest  home-screen app definition
icons/                generated PNG icons (180/192/512)
vercel.json           forces plain static deploy, no framework build
```

## Rendering

- Internal resolution is an authentic **224x288** (28x31 tiles of 8px + HUD
  rows); CSS scales the canvas to the viewport with `image-rendering: pixelated`.
- The maze is rendered **once per level** to an offscreen canvas. Walls are
  filled tiles that pull back 2px from any face adjacent to a corridor
  (12px visual channels), with a 1px light edge and rounded outer corners.
- All sprites are **rasterized in code** at startup (`rasterPac`, `rasterGhost`,
  `rasterFruit`) by per-pixel tests — circles, wedges and bitmaps — so they are
  crisp at any scale with zero image assets. Player is 13px, ghosts 12x13,
  sized to fit the visual corridors.
- Text uses an embedded 5x5 pixel font (`FONT`) with integer scaling.

## Maze format

Mazes are stored as 31 rows of **14-character left halves**, mirrored at
runtime to 28 columns (`buildMaze`). Legend:

```
#  wall        .  pellet       o  power pellet
   open path   -  ghost-house door
```

A validation script (kept in the development scratchpad) BFS-checks every
maze: symmetry, all pellets reachable, no dead ends, no 2x2 open blobs, and
an intact ghost house. All four shipped mazes pass.

Design rules the layouts follow, so new mazes stay playable:

- The band around the ghost house carries **three vertical shafts per side**,
  joined above, through (the tunnel row), and below the house — the middle is
  loops, never a funnel, and it is full of pellets.
- Corridor segments must terminate **on** a shaft, or the end tile becomes a
  dead end (the validator catches this).
- A full-width corridor row must be followed above and below by shaft rows,
  or it forms 2x2 open blocks.
- **Tunnel rows are derived from the maze**, not hard-coded: any row whose
  column 0 is open is a tunnel, which is what drives ghost slow-down. Row 14
  is always a tunnel because bonus fruit enters through it.
- Fruit thresholds and siren stages are computed as fractions of each maze's
  pellet total, so boards of different sizes pace identically.

## Movement

Everything moves on the tile grid in pixel space:

- `tryMove` advances an actor up to N px, clamping onto tile centers when a
  wall is ahead, and handles tunnel wraparound.
- `gridWalk` walks an actor while **pausing at every tile-center crossing** so
  a `decide` callback can pick the next direction — this is what makes ghosts
  turn at intersections rather than only at walls.
- The player uses buffered input with instant reversal and a 3px cornering
  window (snap-to-center on perpendicular turns).

## Ghost AI

Ghost state machine: `in` (house bounce) → `leave` (align to door, rise) →
`out` (grid navigation) → optionally `dead` (eyes) → `enter` (descend) → revive.

While `out`, at each tile center a ghost picks the non-reverse open direction
minimizing straight-line distance to its **target tile**:

- scatter mode: fixed home corner per ghost
- chase mode: per-personality targets (direct / 4-ahead / mirror-flank /
  distance-gated)
- frightened: uniformly random choice
- dead (eyes): descends a **BFS distance field to the house door**
  (`computeDoorDist`, precomputed per maze) — guaranteed shortest path home,
  reverse allowed.

Mode waves, frightened timers, tunnel slow-down, and the red ghost's
low-pellet speed boost are all per-level tuned in `levelSpec`.

## Audio

100% synthesized WebAudio (`initAudio` unlocks on first gesture):

- a persistent sawtooth **siren** whose base pitch rises through four stages
  as pellets deplete, rewired into a fast wobble during frightened mode and
  replaced by high beeps while eyes are in flight
- one-shot `blip()` envelopes (square/saw/triangle + exponential pitch slides)
  for waka, power-up, ghost/fruit eating, death sweep, extra life, and an
  original 8-note ready jingle

## Game loop

Fixed-timestep simulation at **120 Hz** with an accumulator, rendered per
animation frame — consistent physics on 60/120 Hz displays. Pauses on tab
blur/visibility change. State machine: `title → ready → play → (dying|clear)
→ … → over`.

## Testing

Headless-Chromium (Playwright) scripts in the dev scratchpad drive the real
game: keyboard + synthesized touch swipes, forced frightened/eat/fruit/clear
scenarios, eyes-return tracing, and screenshot review at iPhone viewport size.
