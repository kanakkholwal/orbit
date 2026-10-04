/** Which view the calendar shows: the day grid, or the month or year chooser above it. */
export type CalendarView = "days" | "months" | "years";

/** How the next view arrives, written to the root as `data-calendar-motion`. */
export type CalendarMotion = "next" | "prev" | "zoom-in" | "zoom-out";

/** Years per page of the year chooser. */
export const YEAR_PAGE = 12;

/** Columns of the month and year grids; Up and Down move by a row. */
export const CHOICE_COLUMNS = 4;

/** Focus step per arrow key in the month and year grids. */
export const CHOICE_STEP: Record<string, number> = {
	ArrowLeft: -1,
	ArrowRight: 1,
	ArrowUp: -CHOICE_COLUMNS,
	ArrowDown: CHOICE_COLUMNS,
};

/** First year of the page that holds `year`. */
export function yearPageStart(year: number): number {
	return Math.floor(year / YEAR_PAGE) * YEAR_PAGE;
}

/** Years on the page that starts at `start`. */
export function yearPage(start: number): number[] {
	return Array.from({ length: YEAR_PAGE }, (_, i) => start + i);
}

/** Per-cell delay so the chooser's cells rise in one after another. */
export function choiceDelay(index: number): string {
	return `${index * 14}ms`;
}
