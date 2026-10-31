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

- **Works as soon as it is installed.** Teammates walk through each other, see-through up close and not drawn right against you; a teammate's grenade flies through you, and you stand on a teammate's head - before any plugin says a word.
- **A rule, not pairs by hand.** One function says whether one player walks through another; the module works every pair out.
- **Kept up to date by itself.** A spawn, a death, a team change, a player coming in, and a change of any field plugins add to `Player` work the pairs out again - only the pairs of the player it happened to.
- **Nothing else on the server.** No AMX Mod X module is needed: the pairs are amxts's own.
- **One instance per server.** Every plugin that uses it sets the same rule.

## Installation

The project needs `@amxts/core` 0.3.5 or later.

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

Installed, the module needs no plugin: teammates walk through each other, and a partner is see-through closer than 250 units fades out and is not drawn closer than 48 (the core's [`server.walkThroughLook`](#how-a-partner-looks)). A plugin changes who walks through whom with a rule - everyone through everyone, on a KZ server:

```ts
semiclip.rule = () => true;
```

Setting the rule is all it takes: the module works every pair out, and works a player's pairs out again when he spawns, dies, changes sides or comes in. `semiclip.rule = null` makes everyone solid; when the plugin that set the rule stops - unloaded or reloaded - teammates walk through each other again, until a rule is set again.

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

A player one walks through can be see-through up close, or not drawn at all, so he does not block the view. That is the core's `server.walkThroughLook`, for every player: off in the core, and the module turns it on as below. A plugin sets its own, or `{ fadeDistance: 0, hideDistance: 0 }` to turn it off:

```ts
server.walkThroughLook = {
	fadeDistance: 250,  // closer than 250 units a partner is see-through
	opacity: 0.4,       // 40% opaque at 48 units, whole at 250
	hideDistance: 48,   // closer than 48 units he fades out, is not drawn, and is no target of your aim
};
```

### Grenades and standing on a head

A grenade flies through the partners of the player who threw it, and a player wholly above a partner stands on his head instead of falling through him. Both are on; the project turns them off in `amxts.config.ts`:

```ts
export default defineConfig({
	modules: ["@amxts/semiclip"],
	semiclip: {
		grenades: false,     // a grenade bounces off a partner of its thrower
		standOnHead: false,  // a partner above falls through
	},
});
```

A shot, a flash's light and an explosion stop at a partner as at anyone. All of it works on every server, with ReHLDS and ReGameDLL or without them.

### One rule

The rule is one for the server. A plugin that sets it over another plugin's replaces it, and the console warns: the last one set is used. Plugins that each have a say write it into fields (`player.spawnProtected`) that one rule reads.

## API

| Member | What it is |
| --- | --- |
| `semiclip.rule` | `(player, target) => boolean` - whether `player` walks through `target`; a pair walks through when either way says so. Setting it works every pair out; `null` makes everyone solid again. |
| `semiclip.update(player?)` | Works `player`'s pairs out again, or everyone's, after something the rule reads changed that the module does not hear. |
