<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><defs><mask id="SVG2GlueH5m"><g fill="none" stroke-width="1.5"><circle cx="11.5" cy="11.5" r="9.5" stroke="gray"/><path stroke="#fff" stroke-linecap="round" d="M18.5 18.5L22 22M9 11.5h2.5m0 0H14m-2.5 0V14m0-2.5V9"/></g></mask></defs><path fill="currentColor" d="M0 0h24v24H0z" mask="url(#SVG2GlueH5m)"/></svg>
