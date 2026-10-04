<script lang="ts">
import { type ButtonVariant, button } from "$components/ui/button/variants.js";
import { cn } from "$lib/cn.js";
import { YEAR_PAGE } from "./chooser";
import { getCalendarChooser } from "./chooser-state.svelte";
import { calendar } from "./variants";

let { variant = "ghost" }: { variant?: ButtonVariant } = $props();

const chooser = getCalendarChooser();
const navButton = $derived(cn(button({ variant, size: "icon" }), calendar().navButton()));
const year = $derived(chooser.month.year);
const minYear = $derived(chooser.minValue?.year ?? Number.NEGATIVE_INFINITY);
const maxYear = $derived(chooser.maxValue?.year ?? Number.POSITIVE_INFINITY);

const prev = $derived(
	chooser.view === "months"
		? {
				label: "Previous year",
				disabled: year - 1 < minYear,
				run: () => chooser.goTo(year - 1, chooser.month.month, "prev"),
			}
		: {
				label: "Previous years",
				disabled: chooser.pageStart - 1 < minYear,
				run: () => chooser.page(chooser.pageStart - YEAR_PAGE, "prev"),
			},
);
const next = $derived(
	chooser.view === "months"
		? {
				label: "Next year",
				disabled: year + 1 > maxYear,
				run: () => chooser.goTo(year + 1, chooser.month.month, "next"),
			}
		: {
				label: "Next years",
				disabled: chooser.pageStart + YEAR_PAGE > maxYear,
				run: () => chooser.page(chooser.pageStart + YEAR_PAGE, "next"),
			},
);
</script>

<!-- Pages years on the month grid and twelve years on the year grid. -->
<button type="button" aria-label={prev.label} disabled={prev.disabled} onclick={prev.run} class={navButton}>
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
		<path d="m15 6-6 6 6 6" />
	</svg>
</button>
<button type="button" aria-label={next.label} disabled={next.disabled} onclick={next.run} class={navButton}>
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
		<path d="m9 6 6 6-6 6" />
	</svg>
</button>
