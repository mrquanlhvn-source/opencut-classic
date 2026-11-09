import type { ParamDefinition } from "@/params";
import { blockDefinitions } from "..";

// A compact, serializable description of every block and its parameters.
// Shared by the LLM prompt (server) and the deterministic planner (client),
// so there's a single source of truth for "what blocks exist and what knobs
// they have" — the equivalent of H cut's block `mo_ta` + `tham_so`.

export interface CatalogParam {
	key: string;
	type: ParamDefinition["type"];
	default: unknown;
	options?: string[];
}

export interface CatalogEntry {
	id: string;
	name: string;
	description: string;
	params: CatalogParam[];
}

function describeParam(param: ParamDefinition): CatalogParam {
	return {
		key: param.key,
		type: param.type,
		default: param.default,
		options:
			param.type === "select"
				? param.options.map((option) => option.value)
				: undefined,
	};
}

export function buildBlockCatalog(): CatalogEntry[] {
	return blockDefinitions.map((definition) => ({
		id: definition.id,
		name: definition.name,
		description: definition.description ?? definition.name,
		params: definition.params.map(describeParam),
	}));
}

/** Set of known block ids, for validating a plan. */
export function blockIdSet(): Set<string> {
	return new Set(blockDefinitions.map((definition) => definition.id));
}

/** Default param values for a block id, used to fill gaps a plan leaves out. */
export function defaultParamsFor({ blockId }: { blockId: string }): Record<
	string,
	unknown
> {
	const definition = blockDefinitions.find((d) => d.id === blockId);
	if (!definition) return {};
	const values: Record<string, unknown> = {};
	for (const param of definition.params) {
		values[param.key] = param.default;
	}
	return values;
}
