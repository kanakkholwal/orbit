<script lang="ts">
import type { IconProps } from "../types";

let { size = 24, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M7.37769 11.6296C7.37769 9.07276 9.46679 7 12.0438 7C13.4046 7 14.6294 7.57797 15.4824 8.5"/><path stroke-linejoin="round" d="M9.00012 11L7.37769 12.5556L6.00012 11M7.37769 12.5556L7.37769 11.6296"/><path d="M16.6188 12.3704C16.6188 14.9272 14.5217 17 11.9349 17C10.5778 17 9.3555 16.4296 8.50006 15.5181"/><path stroke-linejoin="round" d="M15.0001 12.9991L16.6188 11.4445L18.0001 12.9991M16.6188 11.4445V12.3704"/><circle cx="12" cy="12" r="10" opacity=".5"/></g></svg>
