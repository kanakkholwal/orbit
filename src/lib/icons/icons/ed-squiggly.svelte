<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M12 4L12 20"/><path d="M16 7L16 17" opacity=".5"/><path d="M8 7L8 17" opacity=".5"/><path d="M20 11L20 13"/><path d="M4 11L4 13"/></g></svg>
