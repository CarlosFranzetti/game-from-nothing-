# Project Status

## Canonical repositories

There are two related implementations. They are not duplicate deployments.

| Repository | Role | Stack | Development status |
| --- | --- | --- | --- |
| `game-from-nothing-` | Original browser prototype | Vanilla JavaScript, Canvas, Web Audio, PWA | Preserved reference |
| [`Notmspacman`](https://github.com/CarlosFranzetti/Notmspacman) | Current cross-platform version | React Native, Expo, TypeScript | Active project |

## Where changes should go

Use this repository for small fixes specific to the dependency-free Canvas prototype.

Use `Notmspacman` for new gameplay features, mobile work, Expo improvements, and the
current hosted product.

## Why keep this repository

The prototype remains useful as:

- a compact example of a complete game without a framework
- a reference for Canvas movement and ghost behavior
- a fallback PWA implementation
- a record of the project before the React Native rewrite

The README and repository description should call this the browser prototype so it is
not confused with the current app.
