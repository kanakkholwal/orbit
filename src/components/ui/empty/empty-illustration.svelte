<script lang="ts">
import { untrack } from "svelte";
import { cn } from "$lib/cn.js";
import {
	type EmptyPhase,
	type EmptyScene,
	SCENE_FRAMES,
	SCENE_VIEW,
	SHAPE_KINDS,
} from "./art";
import { createIllustration, initialShapes } from "./illustration";
import { type EmptyIllustrationSize, emptyIllustration } from "./variants";

let {
	scene,
	phase = "idle",
	size = "default",
	label,
	parallax = true,
	class: className,
}: {
	/** Which empty state to draw; changing it morphs every shape into the new scene. */
	scene: EmptyScene;
	/** `loading` and `done` show the scene's progress and resolved drawings. */
	phase?: EmptyPhase;
	size?: EmptyIllustrationSize;
	/** Accessible description; defaults to one written for the scene and phase. */
	label?: string;
	/** Drift a little with the pointer. */
	parallax?: boolean;
	class?: string;
} = $props();

const s = $derived(emptyIllustration({ size }));
const initial = untrack(() => initialShapes(scene, phase));
const paths: SVGPathElement[] = [];
let engine: ReturnType<typeof createIllustration> | null = null;
let shown = untrack(() => ({ scene, phase }));
let reduced = false;

$effect(() => {
	reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (paths.length !== SHAPE_KINDS.length) return;
	const instance = createIllustration(
		paths,
		untrack(() => SCENE_FRAMES[scene][phase]),
	);
	engine = instance;
	return () => instance.destroy();
});
$effect(() => {
	const next = { scene, phase };
	if (shown.scene === next.scene && shown.phase === next.phase) return;
	const sceneChanged = shown.scene !== next.scene;
	shown = next;
	engine?.go(SCENE_FRAMES[next.scene][next.phase], sceneChanged, reduced);
});
</script>

<div
	data-slot="empty-illustration"
	role="presentation"
	class={cn(s.root(), className)}
	onpointermove={(event) => {
		if (!parallax || event.pointerType !== "mouse" || reduced) return;
		const box = event.currentTarget.getBoundingClientRect();
		engine?.pointer(((event.clientX - box.left) / box.width - 0.5) * 2, ((event.clientY - box.top) / box.height - 0.5) * 2);
	}}
	onpointerleave={() => engine?.pointer(0, 0)}
>
	<svg viewBox="0 0 {SCENE_VIEW.width} {SCENE_VIEW.height}" role="img" aria-label={label ?? SCENE_FRAMES[scene][phase].label} class={s.svg()}>
		{#each initial as shape, i (i)}
			<path
				bind:this={paths[i]}
				data-kind={SHAPE_KINDS[i]}
				data-tone={shape.tone}
				d={shape.d}
				opacity={shape.opacity}
				stroke-dasharray={shape.dash}
				class={s.shape()}
			/>
		{/each}
	</svg>
</div>
