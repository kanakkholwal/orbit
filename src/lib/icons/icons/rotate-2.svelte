<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M18.3637 8.05025L17.6566 7.34315C14.5324 4.21895 9.4671 4.21895 6.3429 7.34315C3.21871 10.4673 3.21871 15.5327 6.3429 18.6569C9.4671 21.781 14.5324 21.781 17.6566 18.6569C19.4734 16.84 20.2337 14.3668 19.9374 12.0005" opacity=".5"/><path d="M14.1211 8.04928H18.3637L18.3637 3.80664"/></g></svg>
