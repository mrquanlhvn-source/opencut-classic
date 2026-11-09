import type { GraphicDefinition } from "../../types";
import { clamp01, easeOut, fitFontSize } from "./shared";

// Quote card: a big quotation mark, the quote text, then the author slides in.
// Modeled on H cut's "the_trich_dan". Driven by `progress`.
export const quoteBlock: GraphicDefinition = {
	id: "block-quote",
	name: "Quote",
	keywords: ["quote", "trich dan", "cau noi", "testimonial", "cham ngon"],
	description:
		"A quotation with a big quote mark and an author line. Use for a testimonial, review or memorable line.",
	animated: true,
	params: [
		{ key: "quote", label: "Quote", type: "text", default: "Đơn giản mà mạnh mẽ." },
		{ key: "author", label: "Author", type: "text", default: "— Khách hàng" },
		{ key: "markColor", label: "Mark", type: "color", default: "#FAE67A" },
		{ key: "textColor", label: "Text", type: "color", default: "#F5F5F7" },
		{ key: "authorColor", label: "Author color", type: "color", default: "#FAE67A" },
	],
	render({ ctx, params, width, height, progress = 0.5 }) {
		const quote = String(params.quote ?? "");
		const author = String(params.author ?? "");
		const markColor = String(params.markColor ?? "#FAE67A");
		const textColor = String(params.textColor ?? "#F5F5F7");
		const authorColor = String(params.authorColor ?? "#FAE67A");

		const pin = easeOut(clamp01(progress / 0.22));
		const pout = easeOut(clamp01((progress - 0.85) / 0.15));
		const alpha = pin * (1 - pout);
		if (alpha <= 0.001) return;

		const cx = width / 2;

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		// Big opening quote mark.
		ctx.fillStyle = markColor;
		ctx.font = `800 ${Math.round(height * 0.26)}px Georgia, "Times New Roman", serif`;
		ctx.fillText("“", cx, height * 0.28 + (1 - pin) * height * 0.03);

		// Quote text (wrap to two lines by splitting near the middle if long).
		ctx.fillStyle = textColor;
		const size = fitFontSize({
			ctx,
			text: quote,
			maxWidth: width * 0.84,
			maxSize: Math.round(height * 0.085),
			weight: 600,
		});
		ctx.font = `600 ${size}px Inter, system-ui, sans-serif`;
		ctx.fillText(quote, cx, height * 0.5);

		// Author.
		const authorAlpha = easeOut(clamp01((progress - 0.25) / 0.25));
		ctx.globalAlpha = alpha * authorAlpha;
		ctx.fillStyle = authorColor;
		ctx.font = `600 ${Math.round(height * 0.05)}px Inter, system-ui, sans-serif`;
		ctx.fillText(author, cx, height * 0.66 + (1 - authorAlpha) * height * 0.02);

		ctx.restore();
	},
};
