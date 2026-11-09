import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildPlannerSystemPrompt } from "@/graphics/definitions/blocks/ai/prompt";
import { sanitizePlan } from "@/graphics/definitions/blocks/ai/schema";

// AI block planner. Reads an OpenAI-compatible provider from the environment
// (optional) and returns a validated block plan. When no key is configured it
// returns { configured: false } so the client falls back to its deterministic
// planner — no external dependency required to use the feature.
//
// Env (all optional):
//   OPENAI_API_KEY / LLM_API_KEY   provider key (absent => deterministic)
//   OPENAI_BASE_URL                default https://api.openai.com/v1
//                                  (e.g. http://localhost:11434/v1 for Ollama)
//   OPENAI_MODEL                   default gpt-4o-mini

const bodySchema = z.object({ prompt: z.string().min(1).max(2000) });

export async function POST(request: NextRequest) {
	const raw = await request.json().catch(() => null);
	const body = bodySchema.safeParse(raw);
	if (!body.success) {
		return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
	}

	const apiKey = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ configured: false });
	}

	const baseUrl = (
		process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
	).replace(/\/+$/, "");
	const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

	try {
		const response = await fetch(`${baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				temperature: 0.4,
				response_format: { type: "json_object" },
				messages: [
					{ role: "system", content: buildPlannerSystemPrompt() },
					{ role: "user", content: body.data.prompt },
				],
			}),
			signal: AbortSignal.timeout(30_000),
		});

		if (!response.ok) {
			return NextResponse.json({
				configured: true,
				ops: [],
				error: `Provider returned ${response.status}`,
			});
		}

		const data = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const content = data.choices?.[0]?.message?.content ?? "{}";
		let parsed: unknown;
		try {
			parsed = JSON.parse(content);
		} catch {
			parsed = {};
		}
		const plan = sanitizePlan({ raw: parsed });
		return NextResponse.json({ configured: true, ops: plan.ops });
	} catch {
		return NextResponse.json({
			configured: true,
			ops: [],
			error: "Provider request failed",
		});
	}
}
