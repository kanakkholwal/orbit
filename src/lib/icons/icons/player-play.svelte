<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M3 5.0329L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L20.4086 14.6474C22.5305 13.4935 22.5305 10.5065 20.4086 9.35258L7.59661 2.38548C5.53435 1.26402 3 2.72368 3 5.0329Z" opacity=".5"/><path d="M22 12C22 10.9648 21.4695 9.92953 20.4086 9.35258L7.59661 2.38548C5.53435 1.26402 3 2.72368 3 5.0329V12"/></g></svg>
