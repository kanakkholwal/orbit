<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><circle cx="12" cy="12" r="6"/><path d="M12 2V3"/><path d="M12 21V22"/><path d="M22 12L21 12"/><path d="M3 12L2 12"/><path d="M19.0703 4.9292L18.6775 5.32204" opacity=".5"/><path d="M5.32227 18.6782L4.92943 19.0711" opacity=".5"/><path d="M19.0703 19.0708L18.6775 18.678" opacity=".5"/><path d="M5.32227 5.32178L4.92943 4.92894" opacity=".5"/></g></svg>
