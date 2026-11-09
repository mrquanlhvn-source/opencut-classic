import type { ParamDefinition, ParamValues } from "@/params";

export const DEFAULT_GRAPHIC_SOURCE_SIZE = 512;

export interface GraphicRenderContext {
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
	params: ParamValues;
	width: number;
	height: number;
	/**
	 * Timeline-local playback position, normalized to [0, 1] across the
	 * element's duration. Only provided for definitions with `animated: true`;
	 * `undefined` elsewhere (static graphics, thumbnail previews). Treat
	 * `undefined` as "draw a representative still" (we default it to the end
	 * state so previews look complete).
	 */
	progress?: number;
	/** Timeline-local time in the same unit as the element duration. */
	localTime?: number;
	/** Element duration in the renderer's time unit. */
	duration?: number;
}

export interface GraphicDefinition {
	id: string;
	name: string;
	keywords: string[];
	params: ParamDefinition[];
	/**
	 * When true, the renderer re-renders the source every frame and threads
	 * `progress`/`localTime`/`duration` into the render context, so the
	 * definition can animate procedurally (countdowns, reveals). Static
	 * graphics leave this unset and keep the single-render cached fast path.
	 */
	animated?: boolean;
	render(context: GraphicRenderContext): void;
}

export interface GraphicInstance {
	definitionId: string;
	params: ParamValues;
}
