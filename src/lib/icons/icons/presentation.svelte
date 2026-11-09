<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M2 2H22"/><path d="M9 10.5L10.2929 9.20711C10.6262 8.87377 10.7929 8.70711 11 8.70711C11.2071 8.70711 11.3738 8.87377 11.7071 9.20711L12.2929 9.79289C12.6262 10.1262 12.7929 10.2929 13 10.2929C13.2071 10.2929 13.3738 10.1262 13.7071 9.79289L15 8.5"/><path d="M12 21L12 17M12 21L10 22M12 21L14 22" opacity=".5"/><path d="M20 2V10.5V10.5C20 13.5641 20 15.0962 18.9958 16.0481C17.9916 17 16.3753 17 13.1429 17H10.8571C7.62465 17 6.00841 17 5.00421 16.0481C4 15.0962 4 13.5641 4 10.5V2"/></g></svg>
