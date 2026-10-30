/**
 * Semiclip for amxts plugins: who walks through whom, as a rule over two
 * players. The core keeps the pairs (`player.walksThrough`); this module asks
 * the rule and sets them, again whenever what the rule reads may have changed.
 * How to use it: README.md.
 */
import { ClientPutinserverEvent, Player, TeamInfoMessage, game, server } from "@amxts/core";
import { callingPlugin, onPluginStop } from "@amxts/core/kit";

export default defineModule({
	meta: { name: "resemiclip" },
	imports: [{ from: "@amxts/resemiclip", name: "semiclip" }],
	setup() {
		server.addEventListener("init", start);
		server.addEventListener("putInServer", joined);
		server.addMessageListener("team", teamChanged);
		server.addEventListener("playerChange", event => changed(event.player));
		game.addEventListener("spawn", event => changed(event.player), true);
		game.addEventListener("killed", event => changed(event.player), true);
		onPluginStop(stopped);
	},
});

/**
 * Whether `player` walks through `target`. ReSemiclip lets two players
 * through each other only when the rule says so both ways.
 */
export type SemiclipRule = (player: Player, target: Player) => boolean;

let current: SemiclipRule | null = null;
/** The plugin that set the rule, as `callingPlugin()` numbers it. */
let currentFrom = 0;

/** The server is up. A rule set while the plugins are still loading waits for it. */
let started = false;

/**
 * Who walks through whom, set as a rule over two players - `semiclip`, which
 * plugins use without an import:
 *
 * ```ts
 * semiclip.rule = (player, target) => player.isAlive && target.isAlive && player.team == target.team;
 * ```
 */
export class Semiclip {
	/**
	 * Whether `player` walks through `target`. Setting it takes the rules over
	 * from ReSemiclip and works every pair out; `null` gives them back. The
	 * pairs are worked out again when a player comes or leaves, spawns, dies or
	 * changes sides, and when a field plugins added to `Player` changes.
	 *
	 * Pawn: `resemiclip_take_control`, `resemiclip_set_user_mask`
	 */
	get rule() {
		return current;
	}

	set rule(rule: SemiclipRule | null) {
		if (rule != null && current != null && rule != current) console.warn("[semiclip] a rule was set over another one: the last one set is used");
		const had = current != null;
		current = rule;
		currentFrom = callingPlugin();
		if (!started) return;
		if (rule != null) updateAll(rule);
		else if (had) clearAll();
	}

	/**
	 * Works the pairs out again - `player`'s, or everyone's - after something
	 * the rule reads changed that the module does not hear: a round's mode, a
	 * plugin's own record.
	 */
	update(player?: Player) {
		const rule = activeRule();
		if (rule == null) return;
		if (player) updatePlayer(player, rule);
		else updateAll(rule);
	}
}

/** Who walks through whom: the rule, the pairs worked out again, and what ReSemiclip has. */
export const semiclip = new Semiclip();

/** The plugin that set the rule stopped: its rule goes, and with it its pairs. */
function stopped(plugin: number) {
	if (current == null || currentFrom != plugin) return;
	current = null;
	if (started) clearAll();
}

function start() {
	started = true;
	const rule = current;
	if (rule != null) updateAll(rule);
}

/** The rule, while the module sets the pairs: the server is up and a rule is set. */
function activeRule() {
	return started ? current : null;
}

function joined(event: ClientPutinserverEvent) {
	const player = new Player(event.player.id);
	changed(player);
}

/** A team change is sent to everyone; a TeamInfo to one player only brings him up to date. */
function teamChanged(event: TeamInfoMessage) {
	const target = event.target;
	if (event.player == null && target != null) changed(target);
}

/** Something the rule may read changed on `player`: his pairs. */
function changed(player: Player) {
	const rule = activeRule();
	if (rule != null) updatePlayer(player, rule);
}

function updateAll(rule: SemiclipRule) {
	const players = server.players;
	for (let i = 0; i < players.length; i++) {
		for (let j = i + 1; j < players.length; j++) pair(players[i], players[j], rule);
	}
}

function updatePlayer(player: Player, rule: SemiclipRule) {
	for (const other of server.players) {
		if (other.id != player.id) pair(player, other, rule);
	}
}

/** Sets whether `a` and `b` walk through each other: when the rule lets either one. */
function pair(a: Player, b: Player, rule: SemiclipRule) {
	if (rule(a, b) || rule(b, a)) a.walksThrough.add(b);
	else a.walksThrough.delete(b);
}

/** No rule any more: everyone is solid again. */
function clearAll() {
	for (const player of server.players) player.walksThrough.clear();
}
