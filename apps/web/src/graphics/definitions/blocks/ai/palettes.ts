import type { BlockOp, BlockPlan } from "./schema";

// Knowledge layer: curated color palettes (the equivalent of H cut's
// colors.csv). Each palette maps five semantic roles to hex values; the
// planner picks a palette by mood and we fill each block's color params from
// it, so every block in a scene shares one coherent look.

export type PaletteRole = "accent" | "onAccent" | "text" | "muted" | "background";

export interface Palette {
	id: string;
	name: string;
	/** Mood / theme cues (Vietnamese + English) used to pick the palette. */
	keywords: string[];
	roles: Record<PaletteRole, string>;
}

export const PALETTES: Palette[] = [
	{
		id: "gold-noir",
		name: "Gold Noir",
		keywords: ["sang trọng", "cao cấp", "lịch lãm", "vàng", "gold", "luxury", "premium", "đen"],
		roles: { accent: "#FAE67A", onAccent: "#14161A", text: "#F5F5F7", muted: "#2A2D34", background: "#0B0C0E" },
	},
	{
		id: "tech-blue",
		name: "Tech Blue",
		keywords: ["công nghệ", "hiện đại", "xanh dương", "startup", "saas", "tech", "blue", "ai"],
		roles: { accent: "#4F8BFF", onAccent: "#06122B", text: "#EAF1FF", muted: "#1B2A44", background: "#0A1222" },
	},
	{
		id: "energy-orange",
		name: "Energy Orange",
		keywords: ["năng lượng", "thể thao", "sôi động", "cam", "khuyến mãi", "sale", "orange", "energy"],
		roles: { accent: "#FF7A3C", onAccent: "#241206", text: "#FFF2EA", muted: "#3A2418", background: "#140C08" },
	},
	{
		id: "mono-minimal",
		name: "Mono Minimal",
		keywords: ["tối giản", "đen trắng", "sạch", "minimal", "mono", "clean", "trắng"],
		roles: { accent: "#FFFFFF", onAccent: "#0A0A0A", text: "#FFFFFF", muted: "#3A3A3A", background: "#0A0A0A" },
	},
	{
		id: "mint-fresh",
		name: "Mint Fresh",
		keywords: ["tươi mới", "sức khỏe", "xanh lá", "mint", "thiên nhiên", "fresh", "health", "green"],
		roles: { accent: "#45E3B0", onAccent: "#06281F", text: "#EAFFF7", muted: "#163A30", background: "#08201A" },
	},
	{
		id: "rose-soft",
		name: "Rose Soft",
		keywords: ["nhẹ nhàng", "lãng mạn", "hồng", "mềm mại", "làm đẹp", "beauty", "soft", "pink"],
		roles: { accent: "#FF9EC4", onAccent: "#2B0C1A", text: "#FFEFF6", muted: "#3A1C2A", background: "#1A0C13" },
	},
	{
		id: "violet-night",
		name: "Violet Night",
		keywords: ["sáng tạo", "âm nhạc", "tím", "ban đêm", "gradient", "creative", "music", "violet", "purple"],
		roles: { accent: "#B084FF", onAccent: "#18092B", text: "#F1EAFF", muted: "#2A1B44", background: "#120A22" },
	},
	{
		id: "sun-yellow",
		name: "Sun Yellow",
		keywords: ["vui tươi", "trẻ trung", "vàng tươi", "playful", "fun", "youth"],
		roles: { accent: "#FFD23F", onAccent: "#221A00", text: "#FFFDEA", muted: "#3A3016", background: "#141206" },
	},
];

export function getPalette({ id }: { id: string }): Palette | null {
	return PALETTES.find((palette) => palette.id === id) ?? null;
}

/** Deterministic palette pick: first palette whose keywords appear in the text. */
export function pickPaletteByText({ prompt }: { prompt: string }): string | null {
	const text = prompt.toLowerCase();
	for (const palette of PALETTES) {
		if (palette.keywords.some((keyword) => text.includes(keyword))) {
			return palette.id;
		}
	}
	return null;
}

// Which palette role each block's color params should take. Keeps block files
// clean and colocates the palette wiring. Params not listed keep their default.
const BLOCK_PALETTE_ROLES: Record<string, Record<string, PaletteRole>> = {
	"block-lower-third": {
		barColor: "accent",
		titleColor: "onAccent",
		subtitleColor: "onAccent",
	},
	"block-title": { accentColor: "accent", textColor: "text" },
	"block-countdown": { ringColor: "accent", numberColor: "text" },
	"block-counter": { numberColor: "accent", labelColor: "text" },
	"block-progress-bar": {
		fillColor: "accent",
		trackColor: "muted",
		textColor: "text",
	},
	"block-percent-ring": {
		ringColor: "accent",
		trackColor: "muted",
		textColor: "text",
	},
};

/**
 * Apply the plan's palette (if any) to every op: fill each block's mapped color
 * params from the palette, but never overwrite a color the planner set
 * explicitly. Non-color params are left for the element factory to default.
 */
export function applyPaletteToOps({ plan }: { plan: BlockPlan }): BlockOp[] {
	const palette = plan.palette ? getPalette({ id: plan.palette }) : null;
	if (!palette) return plan.ops;

	return plan.ops.map((op) => {
		const roles = BLOCK_PALETTE_ROLES[op.blockId];
		if (!roles) return op;
		const colors: Record<string, string> = {};
		for (const [key, role] of Object.entries(roles)) {
			if (op.params[key] === undefined) colors[key] = palette.roles[role];
		}
		return { ...op, params: { ...colors, ...op.params } };
	});
}
