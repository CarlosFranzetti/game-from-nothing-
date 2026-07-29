# Contributing

This is a zero-dependency vanilla JS project — please keep it that way.

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works. There is no build step and no npm install.

## Ground rules

1. **No frameworks, no bundlers, no image/audio assets.** Sprites are
   rasterized in code, sound is synthesized. If a feature needs an asset,
   generate it programmatically.
2. **Original content only.** Mazes, art, music and names must not copy the
   classic arcade games this project pays homage to. New mazes must pass the
   reachability/dead-end validation described in `docs/ARCHITECTURE.md`.
3. **Keep the arcade feel.** 224x288 internal resolution, 8px tiles,
   pixel-snapped drawing. Test on an actual phone (swipe feel matters more
   than anything).
4. **Mind the service worker.** Bump the `CACHE` version in `sw.js` whenever
   shipped files change, or installed home-screen apps will serve stale code.

## Testing checklist before a PR

- [ ] Game boots to title, starts on tap/Enter, no console errors
- [ ] Swipe steering works in all four directions (and chained swipes)
- [ ] Power pellet → frightened → eat ghost → eyes return home → revive
- [ ] Fruit spawns (70 pellets), wanders, can be eaten
- [ ] Level clear flash → next level; death → respawn; game over → title
- [ ] Sprites stay inside corridors in all four mazes

See `ROADMAP.md` for ideas that are already scoped and welcome.
