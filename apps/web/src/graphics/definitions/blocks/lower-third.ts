import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, fitFontSize, roundRectPath } from "./shared";

// Lower third / name badge, modeled on H cut's "lower_third" template:
// a bar wipes in from the left carrying a title + subtitle, holds, then wipes
// out near the end of the element. All timing is driven by `progress` (0..1
// over the element's duration), so it animates in preview and in export.
export const lowerThirdBlock: GraphicDefinition = {
	id: "block-lower-third",
	name: "Lower third",
	keywords: ["lower third", "name", "title", "bang ten", "ban ten", "caption"],
	description:
		"Name badge / lower third: a bar wipes in with a person's name and role. Use when introducing a speaker, guest or author.",
	animated: true,
	params: [
		{ key: "title", label: "Title", type: "text", default: "Nguyễn Minh Khang" },
		{
			key: "subtitle",
			label: "Subtitle",
			type: "text",
			default: "Đạo diễn hình ảnh",
		},
		{ key: "barColor", label: "Bar", type: "color", default: "#FAE67A" },
		{
			key: "titleColor",
			label: "Title color",
			type: "color",
			default: "#14161A",
		},
		{
			key: "subtitleColor",
			label: "Subtitle color",
			type: "color",
			default: "#3A3D44",
		},
	],
	render({ ctx, params, width, height, progress = 0.5 }) {
		const title = String(params.title ?? "");
		const subtitle = String(params.subtitle ?? "");
		const barColor = String(params.barColor ?? "#FAE67A");
		const titleColor = String(params.titleColor ?? "#14161A");
		const subtitleColor = String(params.subtitleColor ?? "#3A3D44");

		// Entrance over the first 18%, exit over the last 15%.
		const pin = clamp01(progress / 0.18);
		const pout = clamp01((progress - 0.85) / 0.15);
		const reveal = easeOut(pin) * (1 - easeOut(pout));
		if (reveal <= 0.001) return;

		const padX = width * 0.08;
		const barH = height * 0.2;
		const barY = height * 0.6;
		const fullW = width - padX * 2;
		const w = Math.max(1, fullW * reveal);
		const r = barH * 0.18;

		ctx.save();
		ctx.globalAlpha = Math.min(1, reveal * 1.5);

		// Bar.
		ctx.fillStyle = barColor;
		roundRectPath({ ctx, x: padX, y: barY, w, h: barH, r });
		ctx.fill();

		// Clip text to the revealed portion of the bar so it wipes in with it.
		roundRectPath({ ctx, x: padX, y: barY, w, h: barH, r });
		ctx.clip();

		const textX = padX + barH * 0.3;
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		const titleSize = fitFontSize({
			ctx,
			text: title,
			maxWidth: fullW - barH * 0.5,
			maxSize: Math.round(barH * 0.4),
		});
		ctx.fillStyle = titleColor;
		ctx.font = `800 ${titleSize}px Inter, system-ui, sans-serif`;
		ctx.fillText(title, textX, barY + barH * 0.37);

		const subSize = Math.round(barH * 0.24);
		ctx.fillStyle = subtitleColor;
		ctx.font = `500 ${subSize}px Inter, system-ui, sans-serif`;
		ctx.fillText(subtitle, textX, barY + barH * 0.72);

		ctx.restore();
	},
};
