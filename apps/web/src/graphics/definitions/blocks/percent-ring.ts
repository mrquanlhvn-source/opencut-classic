import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, formatInt } from "./shared";

// Percentage ring: a circular gauge that sweeps up to `target`% while a number
// counts up, then holds with a label. Good for stats / completion reveals.
export const percentRingBlock: GraphicDefinition = {
	id: "block-percent-ring",
	name: "Percent ring",
	keywords: ["percent", "ring", "gauge", "vong phan tram", "stat"],
	animated: true,
	params: [
		{ key: "target", label: "Target %", type: "number", default: 100, min: 0, max: 100, step: 1 },
		{ key: "label", label: "Label", type: "text", default: "Hoàn thành" },
		{ key: "ringColor", label: "Ring", type: "color", default: "#FAE67A" },
		{ key: "trackColor", label: "Track", type: "color", default: "#2A2D34" },
		{ key: "textColor", label: "Text", type: "color", default: "#F5F5F7" },
	],
	render({ ctx, params, width, height, progress = 0.75 }) {
		const target = clamp01(Number(params.target ?? 100) / 100);
		const label = String(params.label ?? "");
		const ringColor = String(params.ringColor ?? "#FAE67A");
		const trackColor = String(params.trackColor ?? "#2A2D34");
		const textColor = String(params.textColor ?? "#F5F5F7");

		// Sweep up over the first 80%, then hold.
		const sweep = easeOut(clamp01(progress / 0.8));
		const current = target * sweep;

		const cx = width / 2;
		const cy = height * 0.46;
		const radius = Math.min(width, height) * 0.3;
		const lineW = Math.max(6, radius * 0.16);

		// Track.
		ctx.lineWidth = lineW;
		ctx.lineCap = "round";
		ctx.strokeStyle = trackColor;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.stroke();

		// Value arc.
		if (current > 0.0001) {
			ctx.strokeStyle = ringColor;
			ctx.beginPath();
			ctx.arc(
				cx,
				cy,
				radius,
				-Math.PI / 2,
				-Math.PI / 2 + current * Math.PI * 2,
			);
			ctx.stroke();
		}

		// Center number.
		ctx.fillStyle = textColor;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `800 ${Math.round(radius * 0.62)}px Inter, system-ui, sans-serif`;
		ctx.fillText(`${formatInt({ value: current * 100 })}%`, cx, cy);

		// Label below the ring.
		if (label) {
			ctx.fillStyle = ringColor;
			ctx.font = `600 ${Math.round(height * 0.05)}px Inter, system-ui, sans-serif`;
			ctx.fillText(label, cx, cy + radius + height * 0.09);
		}
	},
};
