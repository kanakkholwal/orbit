<script lang="ts" generics="T extends string">
  import { ToggleGroup, ToggleGroupItem } from "$components/ui/toggle-group";
  import { cn } from "$lib/utils";

  type Option = { value: T; label: string };

  let {
    options,
    value = $bindable(),
    name,
    size = "default",
    onchange,
    class: className,
  }: {
    options: Option[];
    value: T;
    name: string;
    size?: "default" | "sm";
    onchange?: (value: T) => void;
    class?: string;
  } = $props();
</script>

<ToggleGroup
  type="single"
  variant="segmented"
  {size}
  label={name}
  bind:value
  onValueChange={(v) => {
    if (typeof v === "string" && v) {
      value = v as T;
      onchange?.(v as T);
    }
  }}
  class={cn("w-full", className)}
>
  {#each options as option (option.value)}
    <ToggleGroupItem value={option.value} class="flex-1">{option.label}</ToggleGroupItem>
  {/each}
</ToggleGroup>
