# Changelog

## v0.2.0

> For the 0.3.3 core and the later cores of the 0.3 line.

`@amxts/resemiclip` is `@amxts/semiclip` now, and it needs nothing but amxts. I moved semiclip off the ReSemiclip Metamod plugin: the rule you set drives the core's own pairs, `player.walksThrough`, which the core has since 0.3.3, so a server needs no plugin beside amxts. And it works as soon as it is installed: teammates walk through each other, see-through up close and not drawn right against you, before any plugin sets a rule. A rule reads as before:

```ts
semiclip.rule = (player, target) => player.team == target.team;
```

One thing was wrong in the old README: a pair walks through when the rule lets either one, not both - which is what ReSemiclip did too, so your rule behaves as it did. How a partner looks up close is the core's `server.walkThroughLook`:

```ts
server.walkThroughLook = { fadeDistance: 250, opacity: 0.4, hideDistance: 48 };
```

### ⚠️ Breaking changes

- The package is `@amxts/semiclip`: `npx amxts upgrade` puts it in place of `@amxts/resemiclip` in `package.json` and `amxts.config.ts`, and rewrites a plugin's `import ... from "@amxts/resemiclip"`. The global `semiclip` keeps its name, so most plugins do not change.
- `semiclip.passesThrough(player)` is gone: write `[...player.walksThrough]`.
- It needs `@amxts/core` 0.3.3.
- With no rule of a plugin's, teammates walk through each other and the look is on (`server.walkThroughLook = { fadeDistance: 250, opacity: 0.4, hideDistance: 48 }`). When the rule's plugin stops, teammates walk through each other again; `semiclip.rule = null` makes everyone solid. Nothing hands the rules back to ReSemiclip any more.

### 👉 Changelog

[compare changes](https://github.com/amxts/semiclip/compare/v0.1.3...v0.2.0)

### 🚀 Enhancements

- ⚠️  Semiclip on the core's own pairs ([8a828bd](https://github.com/amxts/semiclip/commit/8a828bd))
- ⚠️  The module is semiclip, `@amxts/semiclip` ([f64ac55](https://github.com/amxts/semiclip/commit/f64ac55))
- Teammates walk through each other by default ([3fd6edc](https://github.com/amxts/semiclip/commit/3fd6edc))

#### ⚠️ Breaking Changes

- ⚠️  Semiclip on the core's own pairs ([8a828bd](https://github.com/amxts/semiclip/commit/8a828bd))
- ⚠️  The module is semiclip, `@amxts/semiclip` ([f64ac55](https://github.com/amxts/semiclip/commit/f64ac55))

### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))

## v0.1.3

> ReSemiclip for amxts 0.2 and 0.3.

This release only widens the core it works with to `@amxts/core` `^0.2.2 || ^0.3.0`, so it can be upgraded together with your project. Nothing else changes. Its prebuilt plugin is built for 0.3; a 0.2 project compiles it once.

### 👉 Changelog

[compare changes](https://github.com/amxts/resemiclip/compare/v0.1.2...v0.1.3)

### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))

## v0.1.2

[compare changes](https://github.com/amxts/resemiclip/compare/v0.1.1...v0.1.2)

### Summary

Built for `@amxts/core` 0.2.2: the package's prebuilt plugin is compiled with that core, so a project on 0.2.2 takes it as it is instead of compiling the module on its first build. The module's API does not change.

### ⬆️ Upgrade guide

`npx amxts upgrade` in the project takes it with the core.

### 📦 Dependencies

| Package | Range |
| --- | --- |
| `@amxts/core` | `^0.2.0`, prebuilt for 0.2.2 |

### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))

## v0.1.1

[compare changes](https://github.com/amxts/resemiclip/compare/v0.1.0...v0.1.1)

### Summary

resemiclip for amxts 0.2.0. Its API is unchanged; the rule a plugin sets goes when that plugin stops, so ReSemiclip gets its own rules back.

### ⚠️ Breaking changes

None in resemiclip itself; it needs `@amxts/core` 0.2.

### ⬆️ Upgrade guide

`npx amxts upgrade` in the project updates it with the core.

### 📦 Dependencies

| Package | From | To |
| --- | --- | --- |
| `@amxts/core` | `^0.1.0` | `^0.2.0` |

### 🩹 Fixes

- Give the rules back when the plugin that set the rule stops ([62e06a8](https://github.com/amxts/resemiclip/commit/62e06a8))

### 💅 Refactors

- Import the core's API by its package name ([4024ec5](https://github.com/amxts/resemiclip/commit/4024ec5))
- Command handlers take one object ([16b55d1](https://github.com/amxts/resemiclip/commit/16b55d1))
- `server.players` over `Player.all` ([ab12133](https://github.com/amxts/resemiclip/commit/ab12133))
- Listen to the team message by its new name ([c8a31d9](https://github.com/amxts/resemiclip/commit/c8a31d9))
- Hear `putInServer` and `playerChange` by their new names ([9b407b7](https://github.com/amxts/resemiclip/commit/9b407b7))

### 📖 Documentation

- The rule goes with the plugin that set it ([7a4ce5b](https://github.com/amxts/resemiclip/commit/7a4ce5b))

### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))
