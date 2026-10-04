import { tv } from "tailwind-variants";

/** The popover look; NavigationMenu's panel reads `surface` too, so both change together. */
export const popover = tv({
	slots: {
		surface: "rounded-xl bg-popover text-foreground text-sm shadow-(--overlay-shadow)",
		content: "w-72 p-3",
	},
});
