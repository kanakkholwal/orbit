<script lang="ts">
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
import { cn } from "$lib/cn.js";
import { CHOICE_STEP, choiceDelay, yearPage } from "./chooser";
import { getCalendarChooser } from "./chooser-state.svelte";
import { calendar } from "./variants";

let { class: classProp }: { class?: string } = $props();

const chooser = getCalendarChooser();
const styles = calendar();
let root = $state<HTMLFieldSetElement>();

const now = today(getLocalTimeZone());
const year = $derived(chooser.month.year);
const first = $derived(
	chooser.minValue
		? chooser.minValue.year * 12 + chooser.minValue.month
		: Number.NEGATIVE_INFINITY,
);
const last = $derived(
	chooser.maxValue
		? chooser.maxValue.year * 12 + chooser.maxValue.month
		: Number.POSITIVE_INFINITY,
);
const monthName = $derived(new DateFormatter(chooser.locale, { month: "short" }));

const cells = $derived(
	chooser.view === "months"
		? Array.from({ length: 12 }, (_, i) => {
				const m = i + 1;
				return {
					key: `m${m}`,
					label: monthName.format(new Date(year, i, 1)),
					selected: m === chooser.month.month,
					current: m === now.month && year === now.year,
					disabled: year * 12 + m < first || year * 12 + m > last,
					pick: () => {
						chooser.goTo(year, m, "zoom-in");
						chooser.show("days", "zoom-in");
					},
				};
			})
		: yearPage(chooser.pageStart).map((y) => ({
				key: `y${y}`,
				label: String(y),
				selected: y === year,
				current: y === now.year,
				disabled: y * 12 + 12 < first || y * 12 + 1 > last,
				pick: () => {
					chooser.goTo(y, chooser.month.month, "zoom-in");
					chooser.show("months", "zoom-in");
				},
			})),
);

let focusedView: string | undefined;

// Focus lands on the chosen cell when the view opens; paging leaves it on the nav.
function autofocus(node: HTMLElement) {
	if (focusedView === chooser.view) return;
	focusedView = chooser.view;
	const target =
		node.querySelector<HTMLElement>("[data-selected]") ??
		node.querySelector<HTMLElement>("[data-current]") ??
		node.querySelector<HTMLElement>("button:not(:disabled)");
	target?.focus();
}

function onkeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }) {
	if (event.key === "Escape") {
		event.stopPropagation();
		chooser.show("days", "zoom-in");
		return;
	}
	const step = CHOICE_STEP[event.key];
	if (step === undefined || !root) return;
	event.preventDefault();
	const buttons = [...root.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
	const at = buttons.indexOf(event.currentTarget);
	buttons[Math.min(buttons.length - 1, Math.max(0, at + step))]?.focus();
}
</script>

<!-- The month or year grid: arrows move between cells, Escape goes back to the days. -->
{#key chooser.view === "months" ? `months-${year}` : `years-${chooser.pageStart}`}
	<fieldset
		bind:this={root}
		use:autofocus
		aria-label={chooser.view === "months" ? `Months of ${year}` : "Years"}
		class={cn(styles.choices(), classProp)}
	>
		{#each cells as cell, i (cell.key)}
			<button
				type="button"
				disabled={cell.disabled}
				aria-pressed={cell.selected}
				data-selected={cell.selected || undefined}
				data-current={(!cell.selected && cell.current) || undefined}
				onclick={cell.pick}
				{onkeydown}
				class={styles.choice()}
				style:animation-delay={choiceDelay(i)}
			>
				{cell.label}
			</button>
		{/each}
	</fieldset>
{/key}
