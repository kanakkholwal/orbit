<script lang="ts">
import { type DateValue, isEqualMonth } from "@internationalized/date";
import { Calendar as CalendarPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import type { ButtonVariant } from "$components/ui/button/variants.js";
import { cn } from "$lib/cn.js";
import CalendarCaption from "./calendar-caption.svelte";
import CalendarCell from "./calendar-cell.svelte";
import CalendarChooser from "./calendar-chooser.svelte";
import CalendarChooserNav from "./calendar-chooser-nav.svelte";
import CalendarDay from "./calendar-day.svelte";
import CalendarGrid from "./calendar-grid.svelte";
import CalendarGridBody from "./calendar-grid-body.svelte";
import CalendarGridHead from "./calendar-grid-head.svelte";
import CalendarGridRow from "./calendar-grid-row.svelte";
import CalendarHeadCell from "./calendar-head-cell.svelte";
import CalendarHeader from "./calendar-header.svelte";
import CalendarMonth from "./calendar-month.svelte";
import CalendarMonths from "./calendar-months.svelte";
import CalendarNav from "./calendar-nav.svelte";
import CalendarNextButton from "./calendar-next-button.svelte";
import CalendarPrevButton from "./calendar-prev-button.svelte";
import { CalendarChooserState, setCalendarChooser } from "./chooser-state.svelte";
import type { WithoutChildren } from "./types";
import { type CalendarCaptionLayout, type CalendarSize, calendar } from "./variants";

let {
	ref = $bindable(null),
	value = $bindable(),
	placeholder = $bindable(),
	class: classProp,
	weekdayFormat = "short",
	buttonVariant = "ghost",
	captionLayout = "label",
	size = "md",
	locale = "en-US",
	minValue,
	maxValue,
	monthFormat,
	yearFormat = "numeric",
	day,
	disableDaysOutsideMonth = false,
	...rest
}: WithoutChildren<CalendarPrimitive.RootProps> & {
	buttonVariant?: ButtonVariant;
	/** The dropdown layouts turn month and year into buttons that open month and year grids. */
	captionLayout?: CalendarCaptionLayout;
	size?: CalendarSize;
	monthFormat?: CalendarPrimitive.MonthSelectProps["monthFormat"];
	yearFormat?: CalendarPrimitive.YearSelectProps["yearFormat"];
	day?: Snippet<[{ day: DateValue; outsideMonth: boolean }]>;
} = $props();

const chooser = new CalendarChooserState({
	placeholder: () => placeholder,
	setPlaceholder: (next) => {
		placeholder = next;
	},
	locale: () => locale,
	minValue: () => minValue,
	maxValue: () => maxValue,
});
setCalendarChooser(chooser);

const styles = calendar();
const days = $derived(chooser.view === "days");
</script>

<!-- bits-ui's single/multiple union can't narrow through a bindable, so value is cast. -->
<CalendarPrimitive.Root
	bind:value={value as never}
	bind:ref
	bind:placeholder
	{weekdayFormat}
	{disableDaysOutsideMonth}
	{locale}
	{minValue}
	{maxValue}
	data-slot="calendar"
	data-calendar-motion={chooser.motion}
	class={cn(calendar({ size }).root(), classProp)}
	{...rest}
>
	{#snippet children({ months, weekdays })}
		<CalendarMonths>
			<CalendarNav>
				{#if days}
					<CalendarPrevButton variant={buttonVariant} />
					<CalendarNextButton variant={buttonVariant} />
				{:else}
					<CalendarChooserNav variant={buttonVariant} />
				{/if}
			</CalendarNav>
			{#each months as month, monthIndex (month)}
				<CalendarMonth>
					<CalendarHeader>
						<CalendarCaption
							{captionLayout}
							{monthFormat}
							{yearFormat}
							month={month.value}
							{locale}
							{monthIndex}
						/>
					</CalendarHeader>
					<!-- The grid keeps its footprint under the chooser; re-keyed so it replays its entrance. -->
					<div class={styles.stage()}>
						{#key `${month.value}-${days}`}
						<CalendarGrid inert={!days} class={days ? undefined : styles.hiddenGrid()}>
							<CalendarGridHead>
								<CalendarGridRow class="select-none">
									{#each weekdays as weekday, i (i)}
										<CalendarHeadCell>{weekday.slice(0, 2)}</CalendarHeadCell>
									{/each}
								</CalendarGridRow>
							</CalendarGridHead>
							<CalendarGridBody>
								{#each month.weeks as weekDates (weekDates)}
									<CalendarGridRow class="mt-2">
										{#each weekDates as date (date)}
											<CalendarCell {date} month={month.value}>
												{#if day}
													{@render day({ day: date, outsideMonth: !isEqualMonth(date, month.value) })}
												{:else}
													<CalendarDay />
												{/if}
											</CalendarCell>
										{/each}
									</CalendarGridRow>
								{/each}
							</CalendarGridBody>
						</CalendarGrid>
						{/key}
						{#if !days && monthIndex === 0}<CalendarChooser />{/if}
					</div>
				</CalendarMonth>
			{/each}
		</CalendarMonths>
	{/snippet}
</CalendarPrimitive.Root>
