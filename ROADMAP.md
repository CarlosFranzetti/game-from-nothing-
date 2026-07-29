# Roadmap — possible future features

Ideas for future versions, roughly ordered by impact vs. effort.

## Near term (high impact, low effort)

- [ ] **Haptic feedback** on pellet chomp / death where supported
- [ ] **Mute button** (small speaker icon in the HUD; state saved to localStorage)
- [ ] **Pause button** on screen (currently pause is tap-after-blur or Space on desktop)
- [ ] **"New high score" celebration** screen with initials entry (3-letter arcade style)
- [ ] **Left/right-handed swipe deadzone tuning** slider on the title screen
- [ ] **Frame-rate independent tuning pass** for very high refresh (120 Hz ProMotion) iPhones

## Gameplay depth

- [ ] **Act intermissions** — short animated cutscenes between level groups
  ("they meet", "the chase", "junior"-style vignettes with our own characters)
- [ ] **Moving fruit exits through the opposite tunnel** instead of timing out
- [ ] **Per-ghost house release counters** (pellet-count based, like the arcade)
  instead of pure timers
- [ ] **Elroy stage 2** — second speed-up for the red ghost when very few pellets remain
- [ ] **Level 256-style easter egg** at absurd level numbers
- [ ] **Two more original mazes** (E, F) with double tunnel pairs and asymmetric
  power-pellet placement
- [ ] **Difficulty presets** — "Arcade" (current), "Chill" (longer frightened time),
  "Turbo" (everything at 120%)

## Presentation

- [ ] **CRT filter toggle** — scanlines, slight barrel distortion, phosphor glow
- [ ] **Attract mode demo** — AI-driven gameplay loop on the title screen
- [ ] **Score pop animation** (rising, fading) instead of static popups
- [ ] **Marquee-style animated title** with color cycling
- [ ] **Ghost "googly eye" tracking** — pupils track the player, not just travel direction

## Platform & meta

- [ ] **Game Center / cloud high scores** (would require a small backend or
  Supabase table; local-only today)
- [ ] **Share card** — post your score as a rendered PNG
- [ ] **Gamepad API support** for Backbone-style iPhone controllers
- [ ] **Landscape layout** with side HUD panels
- [ ] **Replay recording** — store input stream per game, play back deaths
- [ ] **Unit-test harness in CI** — run the existing Playwright smoke tests on
  every push via GitHub Actions

## Explicit non-goals

- Copying the original arcade mazes, sprites, sounds, or music — this project
  stays an **original homage**: layouts, art, and audio are all made from scratch.
- Ads, analytics, accounts, or any network dependency for core play.
