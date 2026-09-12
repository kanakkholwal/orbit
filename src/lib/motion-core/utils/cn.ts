import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { twMergeConfig } from "$lib/utils";

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
