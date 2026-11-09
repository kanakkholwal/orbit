<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { BANNER_DEFAULTS } from "./banner";
import { type CtaBannerSize, type CtaBannerVariant, ctaBanner } from "./variants";
import { setCtaBanner } from "./context";

let {
	children,
	variant = "grain",
	size = "default",
	tint,
	speed = BANNER_DEFAULTS.speed,
	class: classProp,
	...rest
}: {
	children?: Snippet;
	/** `grain`: a noisy tinted panel; `ticker`: lit copy beside a running wordmark. */
	variant?: CtaBannerVariant;
	/** Padding and headline scale. */
	size?: CtaBannerSize;
	/** Any CSS colour. Defaults to green for grain and blue for ticker. */
	tint?: string;
	/** Scales every loop inside: 2 is twice as fast, 0.5 half. */
	speed?: number;
	class?: string;
} & HTMLAttributes<HTMLElement> = $props();

const uid = $props.id();
const titleId = `${uid}-title`;
setCtaBanner(() => ({ variant, size, titleId }));
</script>

<section
	aria-labelledby={titleId}
	{...rest}
	data-slot="cta-banner"
	data-variant={variant}
	class={cn(ctaBanner({ variant, size }).root(), classProp)}
	style:--cta-banner={tint}
	style:--banner-speed={speed > 0 ? speed : BANNER_DEFAULTS.speed}
>
	{@render children?.()}
</section>
