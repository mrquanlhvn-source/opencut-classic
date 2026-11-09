"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/editor/use-editor";
import { buildGraphicPreviewUrl, registerDefaultGraphics } from "@/graphics";
import { applyPaletteToOps, planBlocks } from "@/graphics/definitions/blocks/ai";
import { blockDefinitions } from "@/graphics/definitions/blocks";
import type { ParamValues } from "@/params";
import { buildGraphicElement } from "@/timeline/element-utils";
import { mediaTimeFromSeconds, mediaTimeToSeconds, type MediaTime } from "@/wasm";

registerDefaultGraphics();

export function BlocksView() {
	const editor = useEditor();
	const [prompt, setPrompt] = useState("");
	const [busy, setBusy] = useState(false);

	const insertBlock = ({
		definitionId,
		name,
		startTime,
		params,
		durationSeconds,
	}: {
		definitionId: string;
		name?: string;
		startTime: MediaTime;
		params?: Partial<ParamValues>;
		durationSeconds?: number;
	}) => {
		const element = buildGraphicElement({ definitionId, name, startTime, params });
		editor.timeline.insertElement({
			element:
				durationSeconds == null
					? element
					: {
							...element,
							duration: mediaTimeFromSeconds({ seconds: durationSeconds }),
						},
			placement: { mode: "auto" },
		});
	};

	const addBlock =
		({ definitionId, name }: { definitionId: string; name: string }) =>
		({ currentTime }: { currentTime: MediaTime }) => {
			if (!editor.scenes.getActiveScene()) return;
			insertBlock({ definitionId, name, startTime: currentTime });
		};

	const runPlanner = async () => {
		const text = prompt.trim();
		if (!text || busy) return;
		if (!editor.scenes.getActiveScene()) return;

		setBusy(true);
		try {
			const { plan, source } = await planBlocks({ prompt: text });
			const ops = applyPaletteToOps({ plan });
			if (ops.length === 0) {
				toast.error("Không tạo được block nào từ mô tả này");
				return;
			}

			const baseSeconds = mediaTimeToSeconds({
				time: editor.playback.getCurrentTime(),
			});
			for (const op of ops) {
				insertBlock({
					definitionId: op.blockId,
					startTime: mediaTimeFromSeconds({
						seconds: baseSeconds + op.atSeconds,
					}),
					params: op.params as Partial<ParamValues>,
					durationSeconds: op.durationSeconds,
				});
			}

			toast.success(
				`Đã thêm ${plan.ops.length} block${source === "local" ? " (offline)" : " (AI)"}`,
			);
			setPrompt("");
		} catch {
			toast.error("Lỗi khi tạo block");
		} finally {
			setBusy(false);
		}
	};

	return (
		<PanelView title="Blocks">
			<div className="flex flex-col gap-2 p-2">
				<div className="flex gap-1.5">
					<Input
						size="sm"
						variant="default"
						placeholder="Mô tả cảnh: vd. đếm ngược rồi tiêu đề 'Ra mắt'"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") void runPlanner();
						}}
						className="w-full"
						containerClassName="w-full"
						disabled={busy}
					/>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => void runPlanner()}
						disabled={busy || prompt.trim().length === 0}
					>
						{busy ? "..." : "AI"}
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-2">
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
			</div>
		</PanelView>
	);
}
