<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M18.5002 11.9999C18.5002 13.3807 17.381 14.4999 16.0002 14.4999C14.6195 14.4999 13.5002 13.3807 13.5002 11.9999C13.5002 10.6192 14.6195 9.49994 16.0002 9.49994C17.381 9.49994 18.5002 10.6192 18.5002 11.9999Z"/><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" opacity=".5"/><path d="M10.5 12C10.5 13.3807 9.38071 14.5 8 14.5C6.61929 14.5 5.5 13.3807 5.5 12C5.5 10.6193 6.61929 9.5 8 9.5C9.38071 9.5 10.5 10.6193 10.5 12Z"/><path d="M8 14.5H16"/></g></svg>
