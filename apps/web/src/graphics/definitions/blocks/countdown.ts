import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, fitFontSize } from "./shared";

// Countdown, modeled on H cut's "dem_nguoc" template: counts from `from` down
// (or up) to `to`, one number per beat, with a ring that sweeps each beat, then
// shows an end label. Driven entirely by `progress` (0..1 over the element
// duration) so it animates in both preview and export.
export const countdownBlock: GraphicDefinition = {
	id: "block-countdown",
	name: "Countdown",
	keywords: ["countdown", "dem nguoc", "timer", "intro", "start"],
	description:
		"Countdown from a number down to another with a sweeping ring, then an end label. Use for an intro, launch or 'starting soon'.",
	animated: true,
	params: [
		{ key: "from", label: "From", type: "number", default: 3, min: 0, max: 99, step: 1 },
		{ key: "to", label: "To", type: "number", default: 1, min: 0, max: 99, step: 1 },
		{ key: "endLabel", label: "End label", type: "text", default: "Bắt đầu!" },
		{ key: "ringColor", label: "Ring", type: "color", default: "#FAE67A" },
		{
			key: "numberColor",
			label: "Number",
			type: "color",
			default: "#F5F5F7",
		},
	],
	render({ ctx, params, width, height, progress = 0.5 }) {
		const from = Math.round(Number(params.from ?? 3));
		const to = Math.round(Number(params.to ?? 1));
		const endLabel = String(params.endLabel ?? "");
		const ringColor = String(params.ringColor ?? "#FAE67A");
		const numberColor = String(params.numberColor ?? "#F5F5F7");

		const cx = width / 2;
		const cy = height / 2;
		const radius = Math.min(width, height) * 0.34;
		const lineW = Math.max(4, radius * 0.13);
		const steps = Math.max(1, Math.abs(from - to) + 1);
		const dir = from >= to ? -1 : 1;
		const COUNT_END = 0.82; // reserve the tail for the end label

		// Track ring (always visible).
		ctx.lineWidth = lineW;
		ctx.strokeStyle = "rgba(127,127,127,0.25)";
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.stroke();

		ctx.lineCap = "round";

		if (progress < COUNT_END) {
			const p = progress / COUNT_END; // 0..1 across all beats
			const idxFloat = p * steps;
			const idx = Math.min(steps - 1, Math.floor(idxFloat));
			const beatFrac = clamp01(idxFloat - idx); // 0..1 within this beat
			const value = from + dir * idx;

			// Progress ring sweeps over the current beat.
			ctx.strokeStyle = ringColor;
			ctx.beginPath();
			ctx.arc(
				cx,
				cy,
				radius,
				-Math.PI / 2,
				-Math.PI / 2 + beatFrac * Math.PI * 2,
			);
			ctx.stroke();

			// Number pops in at the start of each beat.
			const pop = easeOut(clamp01(beatFrac / 0.35));
			const scale = 0.7 + 0.3 * pop;
			ctx.save();
			ctx.globalAlpha = Math.min(1, pop * 1.6);
			ctx.translate(cx, cy);
			ctx.scale(scale, scale);
			ctx.fillStyle = numberColor;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = `800 ${Math.round(radius * 1.05)}px Inter, system-ui, sans-serif`;
			ctx.fillText(String(value), 0, radius * 0.05);
			ctx.restore();
		} else {
			// Full ring + end label.
			const lp = easeOut(clamp01((progress - COUNT_END) / (1 - COUNT_END)));
			ctx.strokeStyle = ringColor;
			ctx.beginPath();
			ctx.arc(cx, cy, radius, 0, Math.PI * 2);
			ctx.stroke();

			ctx.save();
			ctx.globalAlpha = lp;
			ctx.translate(cx, cy);
			ctx.scale(0.85 + 0.15 * lp, 0.85 + 0.15 * lp);
			ctx.fillStyle = ringColor;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const size = fitFontSize({
				ctx,
				text: endLabel,
				maxWidth: radius * 1.7,
				maxSize: Math.round(radius * 0.5),
			});
			ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
			ctx.fillText(endLabel, 0, 0);
			ctx.restore();
		}
	},
};
