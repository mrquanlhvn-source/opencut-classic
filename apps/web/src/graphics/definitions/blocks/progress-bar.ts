import type { GraphicDefinition } from "../../types";
import { clamp01, easeInOut, formatInt, roundRectPath } from "./shared";

// Progress bar: a track that fills as the element plays, with a label and an
// optional live percentage. Driven by `progress` (0..1 over the duration).
export const progressBarBlock: GraphicDefinition = {
	id: "block-progress-bar",
	name: "Progress bar",
	keywords: ["progress", "bar", "loading", "thanh tien do", "percent"],
	description:
		"Horizontal bar that fills to 100% with a live percentage and label. Use for loading, a step/progress indicator or completion.",
	animated: true,
	params: [
		{ key: "label", label: "Label", type: "text", default: "Đang tải" },
		{ key: "fillColor", label: "Fill", type: "color", default: "#FAE67A" },
		{ key: "trackColor", label: "Track", type: "color", default: "#2A2D34" },
		{ key: "textColor", label: "Text", type: "color", default: "#F5F5F7" },
		{ key: "showPercent", label: "Show %", type: "boolean", default: true },
	],
	render({ ctx, params, width, height, progress = 0.6 }) {
		const label = String(params.label ?? "");
		const fillColor = String(params.fillColor ?? "#FAE67A");
		const trackColor = String(params.trackColor ?? "#2A2D34");
		const textColor = String(params.textColor ?? "#F5F5F7");
		const showPercent = params.showPercent !== false;

		const fill = easeInOut(clamp01(progress));
		const padX = width * 0.1;
		const fullW = width - padX * 2;
		const barH = height * 0.055;
		const barY = height * 0.5 - barH / 2;
		const r = barH / 2;

		// Label + percentage row above the bar.
		const labelY = barY - height * 0.045;
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = textColor;
		ctx.font = `600 ${Math.round(height * 0.05)}px Inter, system-ui, sans-serif`;
		ctx.textAlign = "left";
		ctx.fillText(label, padX, labelY);
		if (showPercent) {
			ctx.textAlign = "right";
			ctx.font = `700 ${Math.round(height * 0.05)}px Inter, system-ui, sans-serif`;
			ctx.fillText(`${formatInt({ value: fill * 100 })}%`, padX + fullW, labelY);
		}

		// Track.
		ctx.fillStyle = trackColor;
		roundRectPath({ ctx, x: padX, y: barY, w: fullW, h: barH, r });
		ctx.fill();

		// Fill.
		if (fill > 0) {
			ctx.fillStyle = fillColor;
			roundRectPath({
				ctx,
				x: padX,
				y: barY,
				w: Math.max(barH, fullW * fill),
				h: barH,
				r,
			});
			ctx.fill();
		}
	},
};
