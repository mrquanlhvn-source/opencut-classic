import { z } from "zod";
import { blockIdSet } from "./catalog";

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
	/** Optional palette id to tint every block in the plan (see palettes.ts). */
	palette: z.string().optional(),
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
	// Keep only known blocks. We intentionally do NOT merge block defaults here:
	// the palette fills color params next, and the element factory
	// (buildGraphicElement) fills any remaining defaults at insert time.
	const ops = parsed.data.ops.filter((op) => known.has(op.blockId));
	return { ops, palette: parsed.data.palette };
}
