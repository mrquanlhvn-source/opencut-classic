import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, splitItems } from "./shared";

// Checklist: items appear one by one, each with a check mark drawn in. Modeled
// on H cut's "danh_sach_tich". Items are a "a | b | c" string. Driven by
// `progress`.
export const checklistBlock: GraphicDefinition = {
	id: "block-checklist",
	name: "Checklist",
	keywords: ["checklist", "danh sach", "liet ke", "uu diem", "tinh nang", "features"],
	description:
		"A list whose items tick in one by one. Use for features, benefits, steps or a to-do list.",
	animated: true,
	params: [
		{
			key: "items",
			label: "Items (a|b|c)",
			type: "text",
			default: "Nhanh|Gọn nhẹ|Đẹp mắt|Miễn phí",
		},
		{ key: "checkColor", label: "Check", type: "color", default: "#FAE67A" },
		{ key: "textColor", label: "Text", type: "color", default: "#F5F5F7" },
	],
	render({ ctx, params, width, height, progress = 0.85 }) {
		const items = splitItems({ value: String(params.items ?? ""), max: 6 });
		if (items.length === 0) return;
		const checkColor = String(params.checkColor ?? "#FAE67A");
		const textColor = String(params.textColor ?? "#F5F5F7");

		const n = items.length;
		const rowH = Math.min(height * 0.14, (height * 0.74) / n);
		const totalH = rowH * n;
		const startY = (height - totalH) / 2;
		const x = width * 0.16;
		const box = rowH * 0.5;
		const fontSize = Math.round(rowH * 0.42);

		items.forEach((item, index) => {
			// Each row ticks in over its own slice of the timeline.
			const start = (index / n) * 0.7;
			const t = easeOut(clamp01((progress - start) / 0.3));
			if (t <= 0.001) return;

			const cy = startY + rowH * index + rowH / 2;
			ctx.globalAlpha = t;

			// Check box.
			const r = box * 0.26;
			ctx.fillStyle = checkColor;
			ctx.beginPath();
			roundedRect(ctx, x, cy - box / 2, box, box, r);
			ctx.fill();

			// Check mark (drawn proportionally to t).
			ctx.strokeStyle = "#14161A";
			ctx.lineWidth = Math.max(2, box * 0.1);
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			const p1 = { x: x + box * 0.26, y: cy + box * 0.02 };
			const p2 = { x: x + box * 0.44, y: cy + box * 0.2 };
			const p3 = { x: x + box * 0.76, y: cy - box * 0.22 };
			const seg = clamp01(t * 1.2);
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			if (seg < 0.5) {
				const k = seg / 0.5;
				ctx.lineTo(p1.x + (p2.x - p1.x) * k, p1.y + (p2.y - p1.y) * k);
			} else {
				const k = (seg - 0.5) / 0.5;
				ctx.lineTo(p2.x, p2.y);
				ctx.lineTo(p2.x + (p3.x - p2.x) * k, p2.y + (p3.y - p2.y) * k);
			}
			ctx.stroke();

			// Label (slides in slightly).
			ctx.fillStyle = textColor;
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
			ctx.fillText(item, x + box * 1.5 + (1 - t) * width * 0.015, cy);
			ctx.globalAlpha = 1;
		});
	},
};

function roundedRect(
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}
