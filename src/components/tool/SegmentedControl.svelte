<script lang="ts" generics="T extends string">
  import { cn } from "$lib/utils";

  type Option = { value: T; label: string };

  let {
    options,
    value = $bindable(),
    name,
    class: className,
  }: { options: Option[]; value: T; name: string; class?: string } = $props();
</script>

<div
  class={cn("grid gap-1 rounded-lg bg-muted p-1", className)}
  style:grid-template-columns={`repeat(${options.length}, minmax(0, 1fr))`}
>
  {#each options as option (option.value)}
    {@const active = value === option.value}
    <label
      class={cn(
        "relative flex min-h-9 cursor-pointer items-center justify-center rounded-md px-2 text-body transition-[background-color,color,box-shadow] duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
        active ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <input type="radio" {name} value={option.value} bind:group={value} class="sr-only" />
      <span class="truncate">{option.label}</span>
    </label>
  {/each}
</div>
