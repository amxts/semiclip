export default defineConfig({
	modules: ["@amxts/semiclip"],
	// A grenade bounces off a partner of its thrower here; one above a partner still stands on him.
	semiclip: { grenades: false },
});
