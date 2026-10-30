<div align="center">

<img src="assets/logo.svg" width="96" alt="Semiclip">

# Semiclip

*Who walks through whom, as a rule over two players*

[![amxts module](https://img.shields.io/badge/amxts-module-3178c6?style=flat-square)](https://amxts.github.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API](#api)

**English** | [Русский](README.ru.md)

</div>

Semiclip lets players walk through each other. amxts does it on the server itself, as [pairs of players](https://amxts.github.io/docs/game/players#walking-through-each-other) (`player.walksThrough`); this module lets a plugin say who walks through whom as a rule over two players, `(player, target) => boolean`, and keeps the pairs up to date with it.

## Features

- **A rule, not pairs by hand.** One function says whether one player walks through another; the module works every pair out.
- **Kept up to date by itself.** A spawn, a death, a team change, a player coming in, and a change of any field plugins add to `Player` work the pairs out again - only the pairs of the player it happened to.
- **Nothing else on the server.** No AMX Mod X module is needed: the pairs are amxts's own.
- **One instance per server.** Every plugin that uses it sets the same rule.

## Installation

The project needs `@amxts/core` 0.3.3 or later.

```bash
npx amxts module add semiclip
```

It installs the package and adds it to your project's `amxts.config.ts`:

```ts
export default defineConfig({
	modules: ["@amxts/semiclip"],
});
```

## Usage

A plugin uses the module as `semiclip`, without an import line: the build adds the import to the plugins that use it, and builds the module only when some plugin does.

Teammates walk through each other:

```ts
semiclip.rule = (player, target) => player.team == target.team;
```

Setting the rule is all it takes: the module works every pair out, and works a player's pairs out again when he spawns, dies, changes sides or comes in. `semiclip.rule = null` makes everyone solid again, and so does the plugin that set the rule stopping - unloaded or reloaded - until a rule is set again.

### A rule that changes in play

`spawnProtected` below is the plugin's own [field on `Player`](https://amxts.github.io/docs/game/players#shared-player-fields), declared with `declare module`: it starts `false`, every plugin on the server reads and writes it, and it is cleared when the player leaves. A player who has just spawned walks through everyone alive for 3 seconds, and teammates walk through each other:

```ts
declare module "@amxts/core" {
	interface Player {
		spawnProtected: boolean;
	}
}

semiclip.rule = (player, target) =>
	player.isAlive && target.isAlive && (player.spawnProtected || player.team == target.team);

game.addEventListener("spawn", ({ player }) => {
	player.spawnProtected = true;                        // walks through everyone for 3 seconds
	setTimeout(() => (player.spawnProtected = false), 3000);
});
```

The module works the pairs out again by itself when the field changes - on the spawn, and when the timer clears it - with no `update()` call.

### When the pairs are worked out

| When | Which pairs |
| --- | --- |
| `rule` is set | every pair |
| a player comes into the game | his |
| a player spawns, dies or changes sides | his |
| a field plugins add to `Player` changes on a player - any plugin's, or Pawn's | his |
| a player leaves | his pairs go with him |
| `semiclip.update(player)` | `player`'s |
| `semiclip.update()` | every pair |

`update()` is for what the rule reads that the module does not hear - a round's mode kept in a variable, a plugin's own record of a player:

```ts
let everyone = false;

semiclip.rule = (player, target) => everyone || player.team == target.team;

server.addCommand("/party", () => {
	everyone = !everyone;
	semiclip.update();
});
```

### Either way lets a pair through

`rule(player, target)` says whether `player` walks through `target`, but a pair is one: two players walk through each other, or neither does. The pair walks through when the rule lets either one - `rule(a, b) || rule(b, a)`. A rule that says yes for a protected player lets him through everyone, and everyone through him, with no `|| target.spawnProtected` needed.

### Who walks through whom now

The pairs are the core's: `player.walksThrough` is the players he walks through, as a `Set`:

```ts
player.walksThrough.has(other);                  // whether the two walk through each other
for (const partner of player.walksThrough) { }   // each of them
const partners = [...player.walksThrough];
```

### How a partner looks

A player one walks through can be see-through up close, or not drawn at all, so he does not block the view. That is the core's `server.walkThroughLook`, for every player and off by default:

```ts
server.walkThroughLook = {
	fadeDistance: 250,  // closer than 250 units a partner is see-through
	opacity: 0.4,       // 40% opaque right up close, whole at 250
	hideDistance: 32,   // closer than 32 units he is not drawn at all, and no target of your aim
};
```

> [!WARNING]
> On a server without ReGameDLL a partner standing between a player and a flash blocks its light as anyone does. Walking through and the look work on every server; a grenade bounces off a partner.

### One rule

The rule is one for the server. A plugin that sets it over another plugin's replaces it, and the console warns: the last one set is used. Plugins that each have a say write it into fields (`player.spawnProtected`) that one rule reads.

## API

| Member | What it is |
| --- | --- |
| `semiclip.rule` | `(player, target) => boolean` - whether `player` walks through `target`; a pair walks through when either way says so. Setting it works every pair out; `null` makes everyone solid again. |
| `semiclip.update(player?)` | Works `player`'s pairs out again, or everyone's, after something the rule reads changed that the module does not hear. |
