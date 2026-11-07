// The tooltips of src/index.ts, in both languages: scripts/apply-docs.ts writes the
// one AMXTS_DOCS_LANG picks into the JSDoc above each element.
export default {
	'SemiclipOptions': {
		en: `The project's options, \`semiclip: { ... }\` in \`amxts.config.ts\`.`,
		ru: `Настройки проекта, \`semiclip: { ... }\` в \`amxts.config.ts\`.`,
	},
	'SemiclipOptions.grenades': {
		en: `Whether a grenade passes the players its thrower walks through.`,
		ru: `Пролетает ли граната сквозь игроков, сквозь которых проходит бросивший её.`,
	},
	'SemiclipOptions.standOnHead': {
		en: `Whether a player wholly above one he walks through stands on him, instead of falling through.`,
		ru: `Стоит ли игрок, целиком оказавшийся над тем, сквозь кого проходит, у него на голове, а не проваливается.`,
	},
	'SemiclipOptions.fadeDistance': {
		en: `Closer than this, in units, a partner is see-through; \`0\` is off.`,
		ru: `Ближе этого расстояния, в юнитах, партнёр полупрозрачен; \`0\` — выключено.`,
	},
	'SemiclipOptions.opacity': {
		en: `How opaque a partner is at \`hideDistance\`, \`0\` to \`1\`: he grows to whole at \`fadeDistance\`.`,
		ru: `Насколько партнёр непрозрачен на \`hideDistance\`, от \`0\` до \`1\`: к \`fadeDistance\` он становится целым.`,
	},
	'SemiclipOptions.hideDistance': {
		en: `Closer than this, in units, a partner fades out, is not drawn, and is no target of one's aim; \`0\` is off.`,
		ru: `Ближе этого расстояния, в юнитах, партнёр исчезает, не рисуется и не служит целью прицела; \`0\` — выключено.`,
	},
	'SemiclipRule': {
		en: `
			Whether \`player\` walks through \`target\`. Two players walk through each
			other when the rule lets either one: \`rule(a, b) || rule(b, a)\`.
		`,
		ru: `
			Проходит ли \`player\` сквозь \`target\`. Два игрока проходят друг сквозь
			друга, когда правило разрешает это хотя бы в одну сторону:
			\`rule(a, b) || rule(b, a)\`.
		`,
	},
	'Semiclip': {
		en: `
			Who walks through whom, set as a rule over two players - \`semiclip\`, which
			plugins use without an import:

			\`\`\`ts
			semiclip.rule = (player, target) => player.isAlive && target.isAlive && player.team == target.team;
			\`\`\`
		`,
		ru: `
			Кто сквозь кого проходит, заданное правилом над двумя игроками, — \`semiclip\`,
			которым плагины пользуются без импорта:

			\`\`\`ts
			semiclip.rule = (player, target) => player.isAlive && target.isAlive && player.team == target.team;
			\`\`\`
		`,
	},
	'Semiclip.rule': {
		en: `
			Whether \`player\` walks through \`target\`; a pair walks through when either
			way says so. Until a plugin sets it, teammates walk through each other.
			Setting it works every pair out; \`null\` makes everyone solid again, and the
			rule of a plugin that stops goes back to teammates. The pairs are worked out again when a player comes, spawns, dies or
			changes sides, and when a field plugins added to \`Player\` changes.
		`,
		ru: `
			Проходит ли \`player\` сквозь \`target\`; пара проходит, когда это разрешает
			хотя бы одна сторона. Пока плагин его не задал, друг сквозь друга проходят
			союзники. Присваивание рассчитывает каждую пару; \`null\` снова делает всех
			твёрдыми, а правило остановленного плагина снова сменяется союзниками. Пары рассчитываются заново, когда игрок заходит,
			появляется, умирает или меняет команду и когда меняется поле, которое плагины
			добавили в \`Player\`.
		`,
	},
	'Semiclip.update': {
		en: `
			Works the pairs out again - \`player\`'s, or everyone's - after something
			the rule reads changed that the module does not hear: a round's mode, a
			plugin's own record.
		`,
		ru: `
			Рассчитывает пары заново — пары \`player\` или всех — после того, как
			изменилось то, что читает правило и чего модуль не слышит: режим раунда,
			собственная запись плагина.
		`,
	},
	'semiclip': {
		en: `Who walks through whom: the rule, and the pairs worked out again.`,
		ru: `Кто сквозь кого проходит: правило и повторный расчёт пар.`,
	},
};
