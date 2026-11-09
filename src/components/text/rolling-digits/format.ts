import type { RollingDigitsDirection } from "./variants";

/** `true` uses the runtime locale, a string sets the tag, an object goes to Intl.NumberFormat. */
export type RollingDigitsLocale = true | string | Intl.NumberFormatOptions;

export type RollingDigitCell = { key: string; char: string; isDigit: boolean };

const isDigit = (char: string) => char >= "0" && char <= "9";

function localeFormat(value: number, locale: RollingDigitsLocale, pad?: number): string {
	const options: Intl.NumberFormatOptions =
		typeof locale === "object" ? { ...locale } : {};
	if (pad) options.minimumIntegerDigits = pad;
	const tag = typeof locale === "string" ? locale : undefined;
	try {
		return value.toLocaleString(tag, options);
	} catch {
		return value.toString();
	}
}

/** Rounds `value`, then applies `format`, else `locale`, else zero-padding. */
export function formatRollingDigits(
	value: number,
	options: {
		pad?: number;
		locale?: RollingDigitsLocale;
		format?: (value: number) => string;
	},
): string {
	const rounded = Number.isFinite(value) ? Math.round(value) : 0;
	const pad = options.pad && options.pad > 0 ? Math.floor(options.pad) : undefined;
	if (options.format) {
		try {
			return options.format(rounded) || rounded.toString();
		} catch {
			return rounded.toString();
		}
	}
	if (options.locale) return localeFormat(rounded, options.locale, pad);
	if (pad)
		return (rounded < 0 ? "-" : "") + Math.abs(rounded).toString().padStart(pad, "0");
	return rounded.toString();
}

/** Cells keyed from the right, so a digit keeps its column when the value gains or loses one. */
export function rollingDigitCells(text: string): RollingDigitCell[] {
	const chars = Array.from(text || "0");
	let fromRight = 0;
	// Adjacent separators ("US$", a symbol plus a no-break space) need their own index in the run.
	let inRun = 0;
	const keys = chars
		.map((char, i) => ({ char, i }))
		.reverse()
		.map(({ char, i }) => {
			if (isDigit(char)) {
				inRun = 0;
				return { i, key: `d${fromRight++}` };
			}
			return { i, key: `s${fromRight}.${inRun++}` };
		})
		.reverse();
	return chars.map((char, i) => ({
		key: keys[i]?.key ?? `c${i}`,
		char,
		isDigit: isDigit(char),
	}));
}

/** Whether a digit changing from `from` to `to` rolls upward. */
export function rollsUp(
	from: string,
	to: string,
	direction: RollingDigitsDirection,
): boolean {
	return direction === "dynamic" ? Number(to) > Number(from) : direction === "up";
}
