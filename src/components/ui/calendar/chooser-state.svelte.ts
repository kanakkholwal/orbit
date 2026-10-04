import { type DateValue, getLocalTimeZone, today } from "@internationalized/date";
import { createContext } from "svelte";
import { type CalendarMotion, type CalendarView, yearPageStart } from "./chooser";

type ChooserOptions = {
	placeholder: () => DateValue | undefined;
	setPlaceholder: (next: DateValue) => void;
	locale: () => string;
	minValue: () => DateValue | undefined;
	maxValue: () => DateValue | undefined;
};

const monthIndex = (date: DateValue) => date.year * 12 + date.month;

/**
 * Which view a calendar shows, which way it last moved and the year page. Built during a
 * calendar's init; its effect reads the placeholder, so prev/next and arrow keys set the motion too.
 */
export class CalendarChooserState {
	view = $state<CalendarView>("days");
	motion = $state<CalendarMotion | undefined>();
	pageStart = $state(0);
	/** The grid that last closed, so its caption button takes focus back. */
	closedFrom = $state<CalendarView | undefined>();
	#pending: CalendarMotion | undefined;
	#last: number | undefined;
	#options: ChooserOptions;

	constructor(options: ChooserOptions) {
		this.#options = options;
		this.pageStart = yearPageStart(this.month.year);

		$effect(() => {
			const next = options.placeholder();
			if (!next) return;
			const index = monthIndex(next);
			// The primitive's first placeholder write is a mount, not a page turn.
			if (this.#last === undefined || index === this.#last) {
				this.#last = index;
				return;
			}
			this.motion = this.#pending ?? (index > this.#last ? "next" : "prev");
			this.#pending = undefined;
			this.#last = index;
		});
	}

	get month(): DateValue {
		return this.#options.placeholder() ?? today(getLocalTimeZone());
	}

	get locale(): string {
		return this.#options.locale();
	}

	get minValue(): DateValue | undefined {
		return this.#options.minValue();
	}

	get maxValue(): DateValue | undefined {
		return this.#options.maxValue();
	}

	goTo(year: number, month: number, motion: CalendarMotion) {
		const next = this.month.set({ year, month, day: 1 });
		if (monthIndex(next) === this.#last) this.motion = motion;
		else this.#pending = motion;
		this.#options.setPlaceholder(next);
	}

	show(view: CalendarView, motion: CalendarMotion) {
		this.motion = motion;
		this.closedFrom = view === "days" ? this.view : undefined;
		if (view === "years") this.pageStart = yearPageStart(this.month.year);
		this.view = view;
	}

	page(start: number, motion: CalendarMotion) {
		this.motion = motion;
		this.pageStart = start;
	}
}

export const [getCalendarChooser, setCalendarChooser] =
	createContext<CalendarChooserState>();
