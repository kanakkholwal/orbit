<script lang="ts" generics="T extends string">
  import { cn } from "$lib/utils";

  type Choice = { value: T; label: string; hint?: string };

  let {
    choices,
    value = $bindable(),
    name,
    class: className,
  }: { choices: Choice[]; value: T; name: string; class?: string } = $props();
</script>

<div class={cn("flex flex-col gap-1.5", className)}>
  {#each choices as choice (choice.value)}
    {@const active = value === choice.value}
    <label
      class={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
        active ? "border-primary bg-primary/5" : "border-border hover:border-border-strong"
      )}
    >
      <input type="radio" {name} value={choice.value} bind:group={value} class="sr-only" />
      <span
        aria-hidden="true"
        class={cn(
          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
          active ? "border-primary bg-primary" : "border-placeholder"
        )}
      >
        {#if active}<span class="size-1.5 rounded-full bg-primary-foreground"></span>{/if}
      </span>
      <span class="flex min-w-0 flex-col">
        <span class="text-body font-medium text-foreground">{choice.label}</span>
        {#if choice.hint}
          <span class="text-caption text-muted-foreground">{choice.hint}</span>
        {/if}
      </span>
    </label>
  {/each}
</div>
