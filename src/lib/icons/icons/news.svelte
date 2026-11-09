<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V8C21 5.17157 21 3.75736 20.1213 2.87868C19.2426 2 17.8284 2 15 2H9C6.17157 2 4.75736 2 3.87868 2.87868C3 3.75736 3 5.17157 3 8V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22Z"/><path d="M8 2.5V22" opacity=".5"/><path d="M2 12H4" opacity=".5"/><path d="M2 16H4" opacity=".5"/><path d="M2 8H4" opacity=".5"/><path d="M11.5 6.5H16.5"/><path d="M11.5 10H16.5"/></g></svg>
