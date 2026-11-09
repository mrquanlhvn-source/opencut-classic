import { buildBlockCatalog } from "./catalog";
import { PALETTES } from "./palettes";

// System prompt that teaches an LLM the block catalog and the exact JSON plan
// shape to return. Mirrors H cut's planner: the model picks blocks by their
// descriptions and fills each block's own parameters.
export function buildPlannerSystemPrompt(): string {
	const catalog = buildBlockCatalog();
	const palettes = PALETTES.map((palette) => ({
		id: palette.id,
		name: palette.name,
		mood: palette.keywords.slice(0, 5).join(", "),
	}));
	return [
		"You are a motion-graphics director for a video editor.",
		"Given a short scene description, choose motion-graphic BLOCKS and fill their parameters.",
		"",
		"Available blocks (JSON):",
		JSON.stringify(catalog, null, 2),
		"",
		"Available palettes (pick ONE id by mood; it tints all blocks):",
		JSON.stringify(palettes, null, 2),
		"",
		"Return ONLY a JSON object of this shape:",
		'{ "palette": string, "ops": [ { "blockId": string, "params": object, "atSeconds": number, "durationSeconds": number } ] }',
		"",
		"Rules:",
		"- Use only blockId values from the catalog and one palette id from the list.",
		"- In params, only use that block's parameter keys; omit color params so the palette sets them. Omit a key to use its default.",
		"- Lay blocks out in time with atSeconds (>= 0) and durationSeconds (1-10, usually 4).",
		"- At most 6 ops. Keep it tasteful; do not add blocks the description doesn't ask for.",
		"- Write any viewer-facing text (titles, names, labels) in the SAME language as the description.",
	].join("\n");
}
