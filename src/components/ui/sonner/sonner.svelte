<script lang="ts">
	import { IconCircleCheck as CircleCheckIcon } from "@tabler/icons-svelte";
	import { IconInfoCircle as InfoIcon } from "@tabler/icons-svelte";
	import { IconLoader2 as Loader2Icon } from "@tabler/icons-svelte";
	import { IconAlertOctagon as OctagonXIcon } from "@tabler/icons-svelte";
	import { IconAlertTriangle as TriangleAlertIcon } from "@tabler/icons-svelte";

	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
	{...restProps}
	>{#snippet loadingIcon()}
		<Loader2Icon class="size-4 animate-spin" />
	{/snippet}
	{#snippet successIcon()}
		<CircleCheckIcon class="size-4" />
	{/snippet}
	{#snippet errorIcon()}
		<OctagonXIcon class="size-4" />
	{/snippet}
	{#snippet infoIcon()}
		<InfoIcon class="size-4" />
	{/snippet}
	{#snippet warningIcon()}
		<TriangleAlertIcon class="size-4" />
	{/snippet}
</Sonner>
