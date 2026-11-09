<script lang="ts">
import CopyButton from "$components/ui/copy-button/copy-button.svelte";
import { cn } from "$lib/cn.js";

let {
	code,
	html,
	language = "ts",
	filename,
	showLineNumbers = false,
	maxHeight = "24rem",
	class: classProp,
}: {
	code: string;
	/** Pre-highlighted markup from Shiki, highlight.js or similar; `code` stays the copy source. */
	html?: string;
	language?: string;
	filename?: string;
	showLineNumbers?: boolean;
	maxHeight?: string;
	class?: string;
} = $props();

const lines = $derived(code.replace(/\n$/, "").split("\n"));
</script>

<!-- Inset frame: a tinted rim holds the header, the code sits on an inner surface whose
     radius is the outer one minus border and inset. -->
<div
	data-slot="code-block"
	class={cn("min-w-0 max-w-full rounded-xl border border-border bg-card p-1 text-foreground", classProp)}
>
	<div class="flex min-h-8 items-center gap-2 px-1 pb-1">
		<span
			class="inline-flex h-5 shrink-0 items-center rounded border border-border bg-background px-1.5 font-mono font-semibold text-xs text-muted-foreground uppercase tracking-wider"
		>
			{language}
		</span>
		{#if filename}
			<span class="truncate font-mono text-muted-foreground text-xs">{filename}</span>
		{/if}
		<div class="ml-auto shrink-0"><CopyButton text={code} iconOnly /></div>
	</div>
	<div class="overflow-hidden rounded-[calc(var(--radius-xl)-1px-0.25rem)] bg-background">
		{#if html}
			<div
				style:max-height={maxHeight}
				class="scroll-area overflow-auto py-4 font-mono text-sm leading-[1.7] [&_.line]:px-5 [&_code]:block [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre>code:not(:has(.line))]:px-5"
			>
				{@html html}
			</div>
		{:else}
		<pre
			style:max-height={maxHeight}
			class="scroll-area overflow-auto py-4 font-mono text-sm leading-[1.7]"><code
				>{#each lines as line, i (i)}<span class="flex px-5"
						>{#if showLineNumbers}<span
								aria-hidden="true"
								class="mr-4 inline-block w-6 shrink-0 select-none text-right text-muted-foreground/60"
								>{i + 1}</span
							>{/if}<span class="text-foreground">{line || " "}</span></span
					>{/each}</code
			></pre>
		{/if}
	</div>
</div>
