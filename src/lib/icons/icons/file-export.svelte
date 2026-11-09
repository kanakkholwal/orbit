<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12" opacity=".5"/><path stroke-linejoin="round" d="M12 14L12 4M9 7L12 4L15 7"/></g></svg>
