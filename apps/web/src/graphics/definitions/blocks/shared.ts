// Small canvas helpers shared by animated "block" graphic definitions.
// Blocks draw onto the same 2D source canvas the renderer uses for every
// graphic, so they export deterministically — no DOM, no GSAP runtime.

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

/** Cubic ease-out, the workhorse for entrance/exit motion. */
export const easeOut = (t: number): number => 1 - (1 - t) ** 3;

/** Cubic ease-in-out. */
export const easeInOut = (t: number): number =>
	t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

/** Rounded-rectangle path (manual, so it works on OffscreenCanvas too). */
export function roundRectPath({
	ctx,
	x,
	y,
	w,
	h,
	r,
}: {
	ctx: Ctx;
	x: number;
	y: number;
	w: number;
	h: number;
	r: number;
}): void {
	const radius = Math.max(0, Math.min(r, w / 2, h / 2));
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}

/** Split a "a | b | c" string into trimmed, non-empty items (capped). */
export function splitItems({
	value,
	max = 8,
}: {
	value: string;
	max?: number;
}): string[] {
	return value
		.split("|")
		.map((part) => part.trim())
		.filter(Boolean)
		.slice(0, max);
}

/** Parse a "Label:number | Label:number" series into points (value defaults 0). */
export function parseSeries({
	value,
	max = 8,
}: {
	value: string;
	max?: number;
}): Array<{ label: string; value: number }> {
	return splitItems({ value, max }).map((item) => {
		const idx = item.lastIndexOf(":");
		if (idx < 0) return { label: item, value: 0 };
		const label = item.slice(0, idx).trim();
		const num = Number(item.slice(idx + 1).replace(/[^\d.-]/g, ""));
		return { label, value: Number.isFinite(num) ? num : 0 };
	});
}

/** Format an integer with thousands separators (e.g. 1234567 -> "1.234.567"). */
export function formatInt({
	value,
	separator = ".",
}: {
	value: number;
	separator?: string;
}): string {
	return Math.round(value)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** Largest font size (px) that keeps `text` within `maxWidth`, capped at `maxSize`. */
export function fitFontSize({
	ctx,
	text,
	maxWidth,
	maxSize,
	weight = 800,
}: {
	ctx: Ctx;
	text: string;
	maxWidth: number;
	maxSize: number;
	weight?: number;
}): number {
	let size = maxSize;
	for (let i = 0; i < 24; i++) {
		ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
		if (ctx.measureText(text).width <= maxWidth || size <= 8) break;
		size -= Math.max(1, size * 0.08);
	}
	return Math.round(size);
}
