<script lang="ts">
import { cn } from "$lib/cn.js";
import { type MorphTextSize, morphText } from "./variants";

let {
	words,
	index: indexProp,
	defaultIndex = 0,
	onIndexChange,
	intervalMs = 3000,
	subtext,
	size = "inherit",
	class: className,
}: {
	words: string[];
	/** Controlled: which word is showing. Omit to let the component cycle on its own. */
	index?: number;
	defaultIndex?: number;
	onIndexChange?: (index: number) => void;
	/** Time each word stays before morphing. Only runs while uncontrolled. */
	intervalMs?: number;
	/** Line under the word, fading up once after a second. */
	subtext?: string;
	size?: MorphTextSize;
	class?: string;
} = $props();

type Shown = { index: number; key: number };

const uid = $props.id();
const filterId = `morph-${uid}`;
// svelte-ignore state_referenced_locally -- one-time seed, like React's useState(initialValue)
let internalIndex = $state(defaultIndex);
const count = $derived(words.length);
const index = $derived(
	count > 0 ? (((indexProp ?? internalIndex) % count) + count) % count : 0,
);
// svelte-ignore state_referenced_locally -- seeded once; later changes flow through the effect
let shown = $state<Shown>({ index, key: 0 });
let leaving = $state<Shown[]>([]);

$effect.pre(() => {
	if (shown.index === index) return;
	leaving.push(shown);
	shown = { index, key: shown.key + 1 };
});

$effect(() => {
	if (indexProp !== undefined || count <= 1) return;
	const id = setInterval(() => {
		const next = (index + 1) % count;
		internalIndex = next;
		onIndexChange?.(next);
	}, intervalMs);
	return () => clearInterval(id);
});

const styles = $derived(morphText({ size, layout: subtext ? "stacked" : "inline" }));
const longest = $derived(words.reduce((a, b) => (b.length > a.length ? b : a), ""));
</script>

{#if count > 0}
	<span data-slot="morph-text" class={cn(styles.root(), className)}>
		<svg aria-hidden="true" focusable="false" class={styles.filter()}>
			<filter id={filterId}>
				<feColorMatrix
					in="SourceGraphic"
					result="goo"
					type="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -9"
				/>
				<feComposite in="SourceGraphic" in2="goo" operator="atop" />
			</filter>
		</svg>
		<span class={styles.word()} style:filter="url(#{filterId})">
			<span aria-hidden="true" class={styles.sizer()}>{longest}</span>
			<span class={styles.stage()}>
				{#each leaving as item (item.key)}
					<span
						aria-hidden="true"
						class={cn(styles.item(), "morph-text-exit")}
						onanimationend={() => (leaving = leaving.filter((l) => l.key !== item.key))}
						>{words[item.index]}</span
					>
				{/each}
				{#key shown.key}
					<span class={cn(styles.item(), "morph-text-enter")}>{words[index]}</span>
				{/key}
			</span>
		</span>
		{#if subtext}
			<span class={styles.subtext()}>{subtext}</span>
		{/if}
	</span>
{/if}
