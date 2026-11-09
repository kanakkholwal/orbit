<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M2 5.5L3.21429 7L7.5 3"/><path stroke-linejoin="round" d="M2 12.5L3.21429 14L7.5 10" opacity=".5"/><path stroke-linejoin="round" d="M2 19.5L3.21429 21L7.5 17"/><path d="M22 19L12 19"/><path d="M22 12L12 12" opacity=".5"/><path d="M22 5L12 5"/></g></svg>
