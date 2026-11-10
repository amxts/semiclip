// Semiclip on the fake server: the playground's spawn protection plugin sets a
// rule - teammates walk through each other, a player just spawned through
// everyone alive for 3 seconds - and the module works the pairs out, again
// whenever something the rule reads changes. The pairs are the core's, read
// here as server.walksThrough(id).
import { describe, expect, it } from "vitest";
import { setup } from "@amxts/core/test-utils";

describe("semiclip", () => {
	it("the rule sets every pair as players come", async () => {
		const server = await setup({ rootDir: "playground" });
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		const carl = server.join("Carl", { team: "TERRORIST" });

		expect(server.walksThrough(alice.id)).toEqual([bob.id]);
		expect(server.walksThrough(bob.id)).toEqual([alice.id]);
		expect(server.walksThrough(carl.id)).toEqual([]);

		bob.say("/through");
		expect(server.log).toContain("Bob walks through: Alice");
	}, 120_000);

	it("the project's options go to the core, the ones left out by default", async () => {
		const server = await setup({ rootDir: "playground" });
		expect(server.walkThroughOptions).toEqual({ grenades: false, standOnHead: true });
	}, 120_000);

	it("a field written, a team changed, a death, a spawn and a player leaving are heard without update()", async () => {
		const server = await setup({ rootDir: "playground" });
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		const carl = server.join("Carl", { team: "TERRORIST" });

		// A field: a player just spawned walks through everyone alive, and
		// everyone through him, until the timer takes his protection off.
		server.fireHook("spawn", [carl.id]);
		expect(server.walksThrough(carl.id)).toEqual([alice.id, bob.id]);
		expect(server.walksThrough(alice.id)).toEqual([bob.id, carl.id]);

		server.advance(3000);
		expect(server.walksThrough(carl.id)).toEqual([]);
		expect(server.walksThrough(alice.id)).toEqual([bob.id]);

		// A team: the game tells everyone with TeamInfo.
		bob.team = "TERRORIST";
		server.sendMessage("TeamInfo", [bob.id, "TERRORIST"]);
		expect(server.walksThrough(bob.id)).toEqual([carl.id]);
		expect(server.walksThrough(alice.id)).toEqual([]);

		// A death and a spawn, which protects him again.
		carl.alive = false;
		server.fireHook("killed", [carl.id, 0, 0]);
		expect(server.walksThrough(bob.id)).toEqual([]);
		carl.alive = true;
		server.fireHook("spawn", [carl.id]);
		expect(server.walksThrough(bob.id)).toEqual([carl.id]);
		expect(server.walksThrough(alice.id)).toEqual([carl.id]);
		server.advance(3000);
		expect(server.walksThrough(alice.id)).toEqual([]);

		// Leaving: the core clears the slot, and the next player in it gets his own pairs.
		carl.disconnect();
		expect(server.walksThrough(bob.id)).toEqual([]);
		const dave = server.join("Dave", { team: "CT" });
		expect(dave.id).toBe(carl.id);
		expect(server.walksThrough(dave.id)).toEqual([alice.id]);
		expect(server.walksThrough(bob.id)).toEqual([]);
	}, 120_000);

	it("the last rule set wins, with a warning; update() works it out again; null makes everyone solid", async () => {
		const server = await setup({ rootDir: "playground" });
		await server.load("test/rules.ts");
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		expect(server.walksThrough(alice.id)).toEqual([bob.id]);

		alice.say("/rules");
		expect(server.log).toContain("a rule was set over another one: the last one set is used");
		expect(server.walksThrough(alice.id)).toEqual([]);

		alice.say("/open");
		expect(server.walksThrough(alice.id)).toEqual([bob.id]);
		expect(server.walksThrough(bob.id)).toEqual([alice.id]);

		alice.say("/release");
		expect(server.walksThrough(alice.id)).toEqual([]);
		expect(server.walksThrough(bob.id)).toEqual([]);
	}, 120_000);

	it("a pair walks through when the rule lets either one", async () => {
		const server = await setup({ rootDir: "playground" });
		await server.load("test/rules.ts");
		const alice = server.join("Alice");
		const bob = server.join("Bob", { team: "TERRORIST" });
		const carl = server.join("Carl");

		alice.say("/oneway");
		expect(server.walksThrough(bob.id)).toEqual([alice.id]);
		expect(server.walksThrough(alice.id)).toEqual([bob.id, carl.id]);
		expect(server.walksThrough(carl.id)).toEqual([alice.id]);
	}, 120_000);

	it("the plugin that set the rule stops: the module's own rule, teammates, comes back; loaded again, it sets its rule once more", async () => {
		const server = await setup({ rootDir: "playground" });
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		const carl = server.join("Carl", { team: "TERRORIST" });
		const protection = server.plugins.find(plugin => plugin.source.endsWith("spawn-protection.ts"))!;
		server.fireHook("spawn", [carl.id]);
		expect(server.walksThrough(carl.id)).toEqual([alice.id, bob.id]);

		server.unload(protection);
		expect(server.walksThrough(carl.id)).toEqual([]);
		expect(server.walksThrough(alice.id)).toEqual([bob.id]);

		await server.load(protection.source);
		// Its rule again: Carl, protected since his spawn, walks through everyone alive.
		expect(server.walksThrough(carl.id)).toEqual([alice.id, bob.id]);
		expect(server.log).not.toContain("a rule was set over another one");
	}, 120_000);

	it("a plugin turns standing on a head off while it runs; when it stops, the project's comes back", async () => {
		const server = await setup({ rootDir: "playground" });
		const rules = await server.load("test/rules.ts");
		const alice = server.join("Alice");
		expect(server.walkThroughOptions.standOnHead).toBe(true);

		alice.say("/nohead");
		expect(server.log).toContain("standOnHead false");
		expect(server.walkThroughOptions).toEqual({ grenades: false, standOnHead: false });

		server.unload(rules);
		expect(server.walkThroughOptions).toEqual({ grenades: false, standOnHead: true });
	}, 120_000);

	it("with no plugin's rule, teammates walk through each other, and the look is on", async () => {
		const server = await setup({ rootDir: "playground" });
		server.unload(server.plugins.find(plugin => plugin.source.endsWith("spawn-protection.ts"))!);
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		const carl = server.join("Carl", { team: "TERRORIST" });

		expect(server.walksThrough(alice.id)).toEqual([bob.id]);
		expect(server.walksThrough(carl.id)).toEqual([]);
		expect(server.walkThroughLook).toEqual({ fadeDistance: 250, opacity: 0.4, hideDistance: 60 });
	}, 120_000);
});
