import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, fitFontSize, formatInt } from "./shared";

// Number counter: animates a big number from `from` up to `to` (with thousands
// separators and optional prefix/suffix), then shows a label. Good for stat hits.
export const counterBlock: GraphicDefinition = {
	id: "block-counter",
	name: "Counter",
	keywords: ["counter", "number", "stat", "dem so", "count up"],
	animated: true,
	params: [
		{ key: "from", label: "From", type: "number", default: 0, min: 0, max: 1_000_000, step: 1 },
		{ key: "to", label: "To", type: "number", default: 1000, min: 0, max: 1_000_000, step: 1 },
		{ key: "prefix", label: "Prefix", type: "text", default: "" },
		{ key: "suffix", label: "Suffix", type: "text", default: "+" },
		{ key: "label", label: "Label", type: "text", default: "Người dùng" },
		{ key: "numberColor", label: "Number", type: "color", default: "#FAE67A" },
		{ key: "labelColor", label: "Label color", type: "color", default: "#F5F5F7" },
	],
	render({ ctx, params, width, height, progress = 0.7 }) {
		const from = Number(params.from ?? 0);
		const to = Number(params.to ?? 1000);
		const prefix = String(params.prefix ?? "");
		const suffix = String(params.suffix ?? "");
		const label = String(params.label ?? "");
		const numberColor = String(params.numberColor ?? "#FAE67A");
		const labelColor = String(params.labelColor ?? "#F5F5F7");

		// Count over the first 80%, then hold on the final value.
		const t = easeOut(clamp01(progress / 0.8));
		const value = from + (to - from) * t;
		const text = `${prefix}${formatInt({ value })}${suffix}`;

		const cx = width / 2;
		const cy = height * 0.46;

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const size = fitFontSize({
			ctx,
			text,
			maxWidth: width * 0.84,
			maxSize: Math.round(height * 0.26),
		});
		ctx.fillStyle = numberColor;
		ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
		ctx.fillText(text, cx, cy);

		if (label) {
			ctx.fillStyle = labelColor;
			ctx.font = `500 ${Math.round(height * 0.055)}px Inter, system-ui, sans-serif`;
			ctx.fillText(label, cx, cy + height * 0.17);
		}
	},
};
