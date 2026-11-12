<script lang="ts" generics="T extends string">
  import { ToggleGroup, ToggleGroupItem } from "$components/ui/toggle-group";
  import { cn } from "$lib/utils";

  type Option = { value: T; label: string };

  let {
    options,
    value,
    name,
    onchange,
    class: className,
  }: {
    options: Option[];
    value: T;
    /** Accessible name of the group. */
    name: string;
    onchange: (value: T) => void;
    class?: string;
  } = $props();
</script>

<!-- Wrapping pill choices: use for 5 to 8 options that would be cramped in a segmented control. -->
<ToggleGroup
  type="single"
  variant="chip"
  label={name}
  {value}
  onValueChange={(v) => {
    if (typeof v === "string" && v) onchange(v as T);
  }}
  class={cn("w-full", className)}
>
  {#each options as option (option.value)}
    <ToggleGroupItem value={option.value} class="whitespace-nowrap max-sm:min-h-11 max-sm:px-3.5">
      {option.label}
    </ToggleGroupItem>
  {/each}
</ToggleGroup>
