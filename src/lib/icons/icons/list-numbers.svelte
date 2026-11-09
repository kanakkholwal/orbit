<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M4 16L13 16"/><path d="M6 11H13" opacity=".5"/><path d="M8 6L13 6" opacity=".5"/><path stroke-linejoin="round" d="M17 4V20L20 16"/></g></svg>
