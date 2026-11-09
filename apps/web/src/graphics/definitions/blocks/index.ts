import type { GraphicDefinition } from "../../types";
import { countdownBlock } from "./countdown";
import { lowerThirdBlock } from "./lower-third";

// Animated "blocks": motion-graphic presets (title badges, countdowns, ...)
// implemented as `animated` graphic definitions. They register into the same
// graphics registry as shapes, so they flow through the timeline, properties,
// preview and export unchanged — the Blocks panel just lists these ids.
export const blockDefinitions: GraphicDefinition[] = [
	lowerThirdBlock,
	countdownBlock,
];

export { lowerThirdBlock, countdownBlock };
