"use client";

import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { useEditor } from "@/editor/use-editor";
import { buildGraphicPreviewUrl, registerDefaultGraphics } from "@/graphics";
import { blockDefinitions } from "@/graphics/definitions/blocks";
import { buildGraphicElement } from "@/timeline/element-utils";
import type { MediaTime } from "@/wasm";

registerDefaultGraphics();

export function BlocksView() {
	const editor = useEditor();

	const addBlock =
		({ definitionId, name }: { definitionId: string; name: string }) =>
		({ currentTime }: { currentTime: MediaTime }) => {
			const activeScene = editor.scenes.getActiveScene();
			if (!activeScene) return;

			const element = buildGraphicElement({
				definitionId,
				name,
				startTime: currentTime,
			});

			editor.timeline.insertElement({
				element,
				placement: { mode: "auto" },
			});
		};

	return (
		<PanelView title="Blocks">
			<div className="grid grid-cols-2 gap-2 p-2">
				{blockDefinitions.map((definition) => (
					<DraggableItem
						key={definition.id}
						name={definition.name}
						aspectRatio={1}
						preview={
							<img
								src={buildGraphicPreviewUrl({ definitionId: definition.id })}
								alt={definition.name}
								draggable={false}
								className="size-full rounded bg-black/40 object-contain"
							/>
						}
						dragData={{
							id: definition.id,
							type: "graphic",
							name: definition.name,
							definitionId: definition.id,
							params: {},
						}}
						onAddToTimeline={addBlock({
							definitionId: definition.id,
							name: definition.name,
						})}
					/>
				))}
			</div>
		</PanelView>
	);
}
