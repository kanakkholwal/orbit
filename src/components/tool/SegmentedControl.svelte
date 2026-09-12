<script lang="ts" generics="T extends string">
  import { cn } from "$lib/utils";

  type Option = { value: T; label: string };

  let {
    options,
    value = $bindable(),
    name,
    size = "default",
    class: className,
  }: {
    options: Option[];
    value: T;
    name: string;
    /** `default` is 40px tall like a default Button; `sm` is 36px like a `sm` Button. */
    size?: "default" | "sm";
    class?: string;
  } = $props();
</script>

<div
  class={cn("grid rounded-lg bg-muted", size === "sm" ? "h-9 gap-0.5 p-0.5" : "h-10 gap-1 p-1", className)}
  style:grid-template-columns={`repeat(${options.length}, minmax(0, 1fr))`}
>
  {#each options as option (option.value)}
    {@const active = value === option.value}
    <label
      class={cn(
        "relative flex h-full cursor-pointer items-center justify-center rounded-md px-3 text-body transition-[background-color,color,box-shadow] duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
        active ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <input type="radio" {name} value={option.value} bind:group={value} class="sr-only" />
      <span class="truncate">{option.label}</span>
    </label>
  {/each}
</div>
