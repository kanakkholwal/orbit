<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"/><path d="M19 19L17.5 17.5" opacity=".5"/><path d="M19 5L17.5 6.5" opacity=".5"/><path d="M5 19L6.5 17.5" opacity=".5"/><path d="M5 5L6.5 6.5" opacity=".5"/><path d="M2 12H4" opacity=".5"/><path d="M19.9998 12L21.9998 12" opacity=".5"/><path d="M12 4.00021L12 2.00021" opacity=".5"/><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 11.3698 9.43408 10.4955 9.972 9.65412C10.7764 8.39585 11.1786 7.76672 12 7.76672C12.8214 7.76672 13.2236 8.39585 14.028 9.65412C14.5659 10.4955 15 11.3698 15 12Z"/></g></svg>
