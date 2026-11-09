import { planDeterministic } from "./deterministic";
import { type BlockPlan, sanitizePlan } from "./schema";

export type { BlockOp, BlockPlan } from "./schema";
export { buildBlockCatalog } from "./catalog";
export { applyPaletteToOps, PALETTES } from "./palettes";

export interface PlanResult {
	plan: BlockPlan;
	/** "ai" when a configured LLM produced the plan, "local" for the fallback. */
	source: "ai" | "local";
}

/**
 * Plan blocks for a prompt. Tries the server AI route first; if no provider is
 * configured (or it errors / returns nothing), falls back to the deterministic
 * keyword planner so the feature always works offline.
 */
export async function planBlocks({
	prompt,
}: {
	prompt: string;
}): Promise<PlanResult> {
	try {
		const response = await fetch("/api/plan-blocks", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt }),
		});
		if (response.ok) {
			const data = (await response.json()) as {
				configured?: boolean;
				ops?: unknown;
			};
			if (data.configured && Array.isArray(data.ops)) {
				const plan = sanitizePlan({ raw: { ops: data.ops } });
				if (plan.ops.length > 0) return { plan, source: "ai" };
			}
		}
	} catch {
		// Network/route error — fall through to the local planner.
	}

	return {
		plan: sanitizePlan({ raw: planDeterministic({ prompt }) }),
		source: "local",
	};
}
