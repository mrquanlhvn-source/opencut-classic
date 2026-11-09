import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, parseSeries } from "./shared";

// Animated bar chart: bars grow from the baseline, staggered, with labels and
// values. Modeled on H cut's "bieu_do_cot". Data is a "Label:value|..." string
// so it fits the text param type. Driven by `progress`.
export const barChartBlock: GraphicDefinition = {
	id: "block-bar-chart",
	name: "Bar chart",
	keywords: ["bar chart", "bieu do", "cot", "chart", "so sanh", "thong ke"],
	description:
		"Animated bar chart with labels and values. Use to compare a few numbers (sales by month, options, results).",
	animated: true,
	params: [
		{
			key: "data",
			label: "Data (Label:value|...)",
			type: "text",
			default: "T1:30|T2:55|T3:80|T4:65",
		},
		{ key: "barColor", label: "Bars", type: "color", default: "#FAE67A" },
		{ key: "textColor", label: "Text", type: "color", default: "#F5F5F7" },
		{ key: "maxValue", label: "Max (0=auto)", type: "number", default: 0, min: 0, max: 1_000_000, step: 1 },
	],
	render({ ctx, params, width, height, progress = 0.85 }) {
		const points = parseSeries({ value: String(params.data ?? ""), max: 8 });
		if (points.length === 0) return;
		const barColor = String(params.barColor ?? "#FAE67A");
		const textColor = String(params.textColor ?? "#F5F5F7");
		const maxParam = Number(params.maxValue ?? 0);
		const maxValue =
			maxParam > 0
				? maxParam
				: Math.max(1, ...points.map((point) => point.value));

		const padX = width * 0.1;
		const chartW = width - padX * 2;
		const baseline = height * 0.78;
		const chartH = height * 0.5;
		const slot = chartW / points.length;
		const barW = Math.min(slot * 0.6, slot - 10);

		ctx.textAlign = "center";

		points.forEach((point, index) => {
			// Each bar reveals over its own slice of the timeline.
			const start = (index / points.length) * 0.6;
			const grow = easeOut(clamp01((progress - start) / 0.4));
			const full = (point.value / maxValue) * chartH;
			const h = full * grow;
			const x = padX + slot * index + (slot - barW) / 2;
			const y = baseline - h;

			ctx.fillStyle = barColor;
			ctx.fillRect(x, y, barW, h);

			// Value on top (fades in with the bar).
			ctx.globalAlpha = grow;
			ctx.fillStyle = textColor;
			ctx.textBaseline = "bottom";
			ctx.font = `700 ${Math.round(height * 0.04)}px Inter, system-ui, sans-serif`;
			ctx.fillText(String(Math.round(point.value)), x + barW / 2, y - height * 0.012);
			ctx.globalAlpha = 1;

			// Label below the baseline.
			ctx.fillStyle = textColor;
			ctx.textBaseline = "top";
			ctx.font = `500 ${Math.round(height * 0.038)}px Inter, system-ui, sans-serif`;
			ctx.fillText(point.label, x + barW / 2, baseline + height * 0.02);
		});
	},
};
