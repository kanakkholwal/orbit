import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Registers app.css type and shadow tokens so tailwind-merge stops reading them as colours. */
export const twMergeConfig = {
	extend: {
		theme: {
			text: [
				"caption",
				"body",
				"body-sm",
				"body-lg",
				"body-xl",
				"subheading",
				"heading-sm",
				"heading",
				"heading-lg",
				"display",
				"display-xl",
				"micro",
				"title-sm",
				"title-md",
				"display-sm",
				"display-md",
				"display-lg",
				"display-mega",
			],
			shadow: [
				"subtle",
				"ring",
				"brand",
				"button",
				"craft-sm",
				"craft-floating",
			],
		},
	},
};

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
	? Omit<T, "children">
	: T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};
