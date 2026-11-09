<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M17 7.82959L18.6965 9.35641C20.239 10.7447 21.0103 11.4389 21.0103 12.3296C21.0103 13.2203 20.239 13.9145 18.6965 15.3028L17 16.8296"/><path d="M13.9873 5L10.0137 19.8297" opacity=".5"/><path d="M6.99956 7.82959L5.30309 9.35641C3.76054 10.7447 2.98926 11.4389 2.98926 12.3296C2.98926 13.2203 3.76054 13.9145 5.30309 15.3028L6.99956 16.8296"/></g></svg>
