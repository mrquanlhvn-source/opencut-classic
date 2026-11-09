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
