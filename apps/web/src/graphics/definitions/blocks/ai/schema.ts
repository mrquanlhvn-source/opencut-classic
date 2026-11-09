import { z } from "zod";
import { blockIdSet, defaultParamsFor } from "./catalog";

// The plan an AI (or the deterministic fallback) produces: an ordered list of
// blocks to drop on the timeline, each with its params and timing in seconds.

const paramValue = z.union([z.string(), z.number(), z.boolean()]);

export const blockOpSchema = z.object({
	blockId: z.string(),
	params: z.record(z.string(), paramValue).default({}),
	atSeconds: z.number().min(0).default(0),
	durationSeconds: z.number().min(0.3).max(60).default(5),
});

export const blockPlanSchema = z.object({
	ops: z.array(blockOpSchema).max(12),
});

export type BlockOp = z.infer<typeof blockOpSchema>;
export type BlockPlan = z.infer<typeof blockPlanSchema>;

/**
 * Validate a raw plan and drop ops that reference unknown blocks, merging each
 * op's params over the block's defaults. Returns a safe, applyable plan.
 */
export function sanitizePlan({ raw }: { raw: unknown }): BlockPlan {
	const parsed = blockPlanSchema.safeParse(raw);
	if (!parsed.success) return { ops: [] };

	const known = blockIdSet();
	const ops = parsed.data.ops
		.filter((op) => known.has(op.blockId))
		.map((op) => ({
			...op,
			params: { ...defaultParamsFor({ blockId: op.blockId }), ...op.params },
		}));
	return { ops };
}
