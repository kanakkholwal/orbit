<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M22 5.0329L22 18.9671C22 21.2763 19.8658 22.736 18.1292 21.6145L7.34015 14.6474C5.55328 13.4935 5.55328 10.5065 7.34016 9.35258L18.1292 2.38548C19.8658 1.26402 22 2.72368 22 5.0329Z"/><path d="M2 5V19" opacity=".5"/></g></svg>
