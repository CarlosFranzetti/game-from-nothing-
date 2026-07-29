# Gameplay guide

## Objective

Clear every pellet in the maze without getting caught. Clear a maze and you
advance to the next level — faster, meaner, and eventually with no frightened
time at all.

## Controls

| Input | Action |
|---|---|
| Swipe anywhere (touch) | steer — queue your next turn early, it takes at the corner |
| Hold + slide | chain turns without lifting your finger |
| Arrow keys / WASD | steer (desktop) |
| Space / Enter | start · pause |
| Tap | start · resume after pause |

Steering is buffered: swipe **before** you reach an intersection and the turn
executes when you get there, with a few pixels of corner-cutting tolerance,
just like the arcade.

## Scoring

| Event | Points |
|---|---|
| Pellet | 10 |
| Power pellet | 50 |
| Ghosts (chained during one power pellet) | 200 / 400 / 800 / 1600 |
| Bonus fruit | 100–5000 (by level) |
| Extra life | at 10,000 points (once) |

## The ghosts

Each ghost has a distinct personality. Learning them is the game.

- **SPEEDY (red)** — targets your tile directly; speeds up when few pellets
  remain. The relentless one.
- **SNEAKY (pink)** — targets four tiles *ahead* of your direction of travel.
  Watch for ambushes at corners.
- **MOODY (cyan)** — flanks using both your position and the red ghost's,
  mirroring across a point ahead of you. Unpredictable pincers.
- **POKEY (orange)** — chases when far away, but retreats to the bottom-left
  corner whenever it gets within 8 tiles. Shy, but dangerous in open corridors.

Ghosts alternate between **scatter** (retreating to home corners) and
**chase** waves on a per-level schedule, reversing direction at each switch —
that mass about-face is your telegraph.

## Power pellets & frightened mode

Eating a power pellet turns the ghosts blue and reverses them. Eat them for
chained bonuses while they flee randomly. They flash white before recovering.
Frightened time shrinks each level and disappears entirely in the high levels.
Eaten ghosts become eyes that fly straight back to the ghost house, revive,
and come back out.

## Bonus fruit

Twice per maze (after 70 and 170 pellets), a fruit enters through a side
tunnel and wanders the corridors for about ten seconds. Values by level:
cherry 100, strawberry 200, orange 500, pretzel 700, apple 1000, pear 2000,
banana 5000 (random pick past level 7).

## Tunnels

The side tunnels wrap around the screen. Ghosts slow down inside them —
your best escape route in a jam.

## Level progression

| Levels | Maze | Notes |
|---|---|---|
| 1–2 | A (pink) | 80% player speed, 6s frightened |
| 3–5 | B (blue) | speeds rise, frightened shrinks |
| 6–9 | C (amber) | full speed |
| 10–13 | D (indigo) | frightened nearly gone |
| 14+ | C/D alternating | 1s or zero frightened — pure evasion |
