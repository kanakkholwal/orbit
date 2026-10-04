<script lang="ts">
import { DateFormatter, type DateValue, getLocalTimeZone } from "@internationalized/date";
import type { Calendar as CalendarPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getCalendarChooser } from "./chooser-state.svelte";
import { type CalendarCaptionLayout, calendar } from "./variants";

let {
	captionLayout,
	monthFormat = "long",
	yearFormat = "numeric",
	month,
	locale,
	monthIndex = 0,
}: {
	captionLayout: CalendarCaptionLayout;
	monthFormat?: CalendarPrimitive.MonthSelectProps["monthFormat"];
	yearFormat?: CalendarPrimitive.YearSelectProps["yearFormat"];
	month: DateValue;
	locale: string;
	monthIndex?: number;
} = $props();

const chooser = getCalendarChooser();
const styles = calendar();

const asDate = $derived(month.toDate(getLocalTimeZone()));
const monthName = $derived(
	typeof monthFormat === "function"
		? monthFormat(month.month)
		: new DateFormatter(locale, { month: monthFormat }).format(asDate),
);
const yearName = $derived(
	typeof yearFormat === "function"
		? yearFormat(month.year)
		: new DateFormatter(locale, { year: yearFormat }).format(asDate),
);
// Only the first month opens the grids; the others keep a plain label.
const chooses = $derived(captionLayout !== "label" && monthIndex === 0);

let monthButton = $state<HTMLButtonElement>();
let yearButton = $state<HTMLButtonElement>();

// A closed grid takes the focused cell with it, so focus returns to the button that opened it.
$effect(() => {
	const from = chooser.closedFrom;
	if (chooser.view !== "days" || !from || document.activeElement !== document.body)
		return;
	(from === "years" ? yearButton : monthButton)?.focus();
});

function toggle(view: "months" | "years") {
	if (chooser.view === view) chooser.show("days", "zoom-in");
	else chooser.show(view, "zoom-out");
}
</script>

{#snippet chevron()}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="m6 9 6 6 6-6" />
	</svg>
{/snippet}

{#if !chooses}
	{#key month.toString()}
		<span class={styles.heading()}>{monthName} {yearName}</span>
	{/key}
{:else}
	{#if captionLayout !== "dropdown-years"}
		<button
			bind:this={monthButton}
			type="button"
			aria-expanded={chooser.view === "months"}
			onclick={() => toggle("months")}
			class={styles.captionButton()}
		>
			{#key month.month}
				<span class={styles.captionText()}>{monthName}</span>
			{/key}
			{@render chevron()}
		</button>
	{:else}
		<span class={styles.heading()}>{monthName}</span>
	{/if}
	{#if captionLayout !== "dropdown-months"}
		<button
			bind:this={yearButton}
			type="button"
			aria-expanded={chooser.view === "years"}
			onclick={() => toggle("years")}
			class={cn(styles.captionButton(), styles.captionYear())}
		>
			{#key month.year}
				<span class={styles.captionText()}>{yearName}</span>
			{/key}
			{@render chevron()}
		</button>
	{:else}
		<span class={styles.heading()}>{yearName}</span>
	{/if}
{/if}
