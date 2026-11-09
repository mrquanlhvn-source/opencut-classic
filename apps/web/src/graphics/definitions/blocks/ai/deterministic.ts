import { pickPaletteByText } from "./palettes";
import type { BlockOp, BlockPlan } from "./schema";

// Deterministic, keyword-based fallback planner. Runs fully offline (no API
// key) so the AI panel always does something useful; the LLM path replaces it
// when a provider is configured. Understands common Vietnamese + English cues.
// (Keyword rules below map a prompt to one op per matched block.)

function quotedTexts({ prompt }: { prompt: string }): string[] {
	const matches = prompt.match(/[“"']([^“”"']{1,60})[”"']/g) ?? [];
	return matches.map((m) => m.slice(1, -1).trim()).filter(Boolean);
}

function numbersIn({ prompt }: { prompt: string }): number[] {
	return (prompt.match(/\d[\d.,]*/g) ?? [])
		.map((n) => Number(n.replace(/[.,]/g, "")))
		.filter((n) => Number.isFinite(n));
}

function percentIn({ prompt }: { prompt: string }): number | null {
	const m = prompt.match(/(\d{1,3})\s*%/);
	return m ? Math.min(100, Number(m[1])) : null;
}

function has({ text, words }: { text: string; words: string[] }): boolean {
	return words.some((w) => text.includes(w));
}

/**
 * Turn a free-text prompt into a block plan using keyword rules. Each matched
 * rule emits one op; ops are laid out sequentially on the timeline.
 */
export function planDeterministic({ prompt }: { prompt: string }): BlockPlan {
	const text = prompt.toLowerCase();
	const quotes = quotedTexts({ prompt });
	const nums = numbersIn({ prompt });
	const pct = percentIn({ prompt });
	const ops: Array<Omit<BlockOp, "atSeconds" | "durationSeconds">> = [];

	if (has({ text, words: ["đếm ngược", "dem nguoc", "countdown", "sắp bắt đầu", "khởi động", "3 2 1"] })) {
		ops.push({
			blockId: "block-countdown",
			params: {
				from: nums[0] ?? 3,
				to: 1,
				endLabel: quotes[0] ?? "Bắt đầu!",
			},
		});
	}

	if (has({ text, words: ["tiêu đề", "tieu de", "title", "heading", "headline", "mở đầu", "mo dau"] })) {
		ops.push({
			blockId: "block-title",
			params: { text: quotes[0] ?? prompt.slice(0, 40) },
		});
	}

	if (has({ text, words: ["giới thiệu", "gioi thieu", "tên", "ten ", "bảng tên", "lower third", "khách mời", "speaker", "mc ", "diễn giả", "nhân vật"] })) {
		ops.push({
			blockId: "block-lower-third",
			params: {
				title: quotes[0] ?? "Tên của bạn",
				subtitle: quotes[1] ?? "Chức danh",
			},
		});
	}

	if (pct !== null || has({ text, words: ["phần trăm", "phan tram", "vòng tròn", "hoàn thành", "hoan thanh", "tỷ lệ", "ty le", "percent", "gauge", "rate", "score"] })) {
		ops.push({
			blockId: "block-percent-ring",
			params: { target: pct ?? 100, label: quotes[0] ?? "Hoàn thành" },
		});
	}

	if (has({ text, words: ["tiến độ", "tien do", "progress", "đang tải", "dang tai", "loading", "thanh"] })) {
		ops.push({
			blockId: "block-progress-bar",
			params: { label: quotes[0] ?? "Đang tải" },
		});
	}

	if (has({ text, words: ["đếm số", "dem so", "counter", "thống kê", "thong ke", "người dùng", "nguoi dung", "lượt", "số liệu", "so lieu", "stat", "subscriber", "views", "doanh thu", "triệu", "nghìn"] })) {
		const to = nums.length ? Math.max(...nums) : 1000;
		ops.push({
			blockId: "block-counter",
			params: { from: 0, to, suffix: "+", label: quotes[0] ?? "Người dùng" },
		});
	}

	if (has({ text, words: ["trích dẫn", "trich dan", "câu nói", "cau noi", "quote", "châm ngôn", "cham ngon", "nhận xét", "testimonial"] })) {
		ops.push({
			blockId: "block-quote",
			params: {
				quote: quotes[0] ?? "Đơn giản mà mạnh mẽ.",
				author: quotes[1] ?? "— Khách hàng",
			},
		});
	}

	if (has({ text, words: ["biểu đồ", "bieu do", "bar chart", "cột", "so sánh", "so sanh", "chart"] })) {
		ops.push({ blockId: "block-bar-chart", params: {} });
	}

	if (has({ text, words: ["danh sách", "danh sach", "checklist", "liệt kê", "liet ke", "ưu điểm", "uu diem", "tính năng", "tinh nang", "các bước", "cac buoc", "gạch đầu dòng"] })) {
		ops.push({
			blockId: "block-checklist",
			params: quotes.length >= 2 ? { items: quotes.join("|") } : {},
		});
	}

	// Always do something: if nothing matched, show the prompt as a title.
	if (ops.length === 0) {
		ops.push({
			blockId: "block-title",
			params: { text: quotes[0] ?? (prompt.slice(0, 40) || "Tiêu đề") },
		});
	}

	// Lay ops out sequentially, ~4s each, and tint them with a matching palette.
	const DURATION = 4;
	return {
		palette: pickPaletteByText({ prompt }) ?? undefined,
		ops: ops.slice(0, 6).map((op, index) => ({
			...op,
			atSeconds: index * DURATION,
			durationSeconds: DURATION,
		})),
	};
}
