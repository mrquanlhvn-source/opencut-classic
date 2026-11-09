import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, fitFontSize } from "./shared";

// Kinetic title: a large title scales + fades in, an accent underline wipes in
// beneath it, holds, then fades out near the end. Driven by `progress`.
export const titleBlock: GraphicDefinition = {
	id: "block-title",
	name: "Title",
	keywords: ["title", "heading", "kinetic text", "chu to", "intro"],
	animated: true,
	params: [
		{ key: "text", label: "Text", type: "text", default: "TIÊU ĐỀ" },
		{ key: "textColor", label: "Text", type: "color", default: "#F5F5F7" },
		{ key: "accentColor", label: "Accent", type: "color", default: "#FAE67A" },
		{ key: "showUnderline", label: "Underline", type: "boolean", default: true },
	],
	render({ ctx, params, width, height, progress = 0.5 }) {
		const text = String(params.text ?? "");
		const textColor = String(params.textColor ?? "#F5F5F7");
		const accentColor = String(params.accentColor ?? "#FAE67A");
		const showUnderline = params.showUnderline !== false;

		// In over [0,0.25], hold, out over [0.85,1].
		const pin = easeOut(clamp01(progress / 0.25));
		const pout = easeOut(clamp01((progress - 0.85) / 0.15));
		const alpha = pin * (1 - pout);
		if (alpha <= 0.001) return;

		const cx = width / 2;
		const cy = height * 0.48;
		const scale = 0.82 + 0.18 * pin;

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const size = fitFontSize({
			ctx,
			text,
			maxWidth: width * 0.84,
			maxSize: Math.round(height * 0.17),
		});
		ctx.translate(cx, cy);
		ctx.scale(scale, scale);
		ctx.fillStyle = textColor;
		ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
		ctx.fillText(text, 0, 0);

		if (showUnderline) {
			const textW = Math.min(width * 0.84, ctx.measureText(text).width);
			const underline = easeOut(clamp01((progress - 0.12) / 0.3));
			const uw = textW * underline;
			const uy = size * 0.72;
			const uh = Math.max(3, size * 0.07);
			ctx.fillStyle = accentColor;
			ctx.fillRect(-uw / 2, uy, uw, uh);
		}

		ctx.restore();
	},
};
