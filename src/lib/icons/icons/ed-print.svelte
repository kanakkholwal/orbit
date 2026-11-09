<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M9 10H6" opacity=".5"/><path d="M19 14L5 14"/><path d="M18 14V16C18 18.8284 18 20.2426 17.1213 21.1213C16.2426 22 14.8284 22 12 22C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V14"/><path d="M17.9829 6C17.9361 4.44655 17.7629 3.51998 17.1216 2.87868C16.2429 2 14.8287 2 12.0003 2C9.17183 2 7.75761 2 6.87893 2.87868C6.23763 3.51998 6.06438 4.44655 6.01758 6" opacity=".5"/><path d="M15 16.5H9" opacity=".5"/><path d="M13 19H9" opacity=".5"/><path stroke-linejoin="round" d="M17 10H17.0001" opacity=".5"/><path d="M17.9832 17.9827H18C19.5535 17.9359 20.48 17.7626 21.1213 17.1213C22 16.2426 22 14.8284 22 12C22 9.17157 22 7.75736 21.1213 6.87868C20.2426 6 18.8284 6 16 6H8C5.17157 6 3.75736 6 2.87868 6.87868C2 7.75736 2 9.17157 2 12C2 14.8284 2 16.2426 2.87868 17.1213C3.51998 17.7626 4.44655 17.9359 6 17.9827H6.01681"/></g></svg>
