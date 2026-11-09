import type { GraphicDefinition } from "../../types";
import { counterBlock } from "./counter";
import { countdownBlock } from "./countdown";
import { lowerThirdBlock } from "./lower-third";
import { percentRingBlock } from "./percent-ring";
import { progressBarBlock } from "./progress-bar";
import { titleBlock } from "./title";

// Animated "blocks": motion-graphic presets (title badges, countdowns, ...)
// implemented as `animated` graphic definitions. They register into the same
// graphics registry as shapes, so they flow through the timeline, properties,
// preview and export unchanged — the Blocks panel just lists these ids.
export const blockDefinitions: GraphicDefinition[] = [
	lowerThirdBlock,
	titleBlock,
	countdownBlock,
	counterBlock,
	progressBarBlock,
	percentRingBlock,
];

export {
	lowerThirdBlock,
	titleBlock,
	countdownBlock,
	counterBlock,
	progressBarBlock,
	percentRingBlock,
};
