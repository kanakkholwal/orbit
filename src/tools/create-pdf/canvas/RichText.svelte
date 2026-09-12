<script lang="ts">
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
  import { fieldLabel, parseInline, RESERVED_FIELDS } from "../model/fields";

  type Props = {
    value: string;
    onchange?: (value: string) => void;
    placeholder?: string;
    multiline?: boolean;
    /** Allows `**bold**` and `*italic*` rendering when not editing. */
    rich?: boolean;
    data?: Record<string, string>;
    showValues?: boolean;
    /** Focuses this field when it matches the studio's pending focus key. */
    focusKey?: string;
    activeFocusKey?: string | null;
    onfocused?: () => void;
    onenter?: () => void;
    onbackspaceempty?: () => void;
    onslash?: () => void;
    readonly?: boolean;
    /** Hidden while empty unless its block is selected, since the PDF leaves it out. */
    optional?: boolean;
    class?: string;
    style?: string;
    label?: string;
  };

  let {
    value,
    onchange,
    placeholder = "",
    multiline = false,
    rich = true,
    data = {},
    showValues = false,
    focusKey,
    activeFocusKey = null,
    onfocused,
    onenter,
    onbackspaceempty,
    onslash,
    readonly = false,
    optional = false,
    class: className,
    style,
    label,
  }: Props = $props();

  let editing = $state(false);
  let el = $state<HTMLElement | null>(null);

  const FIELD = /(\{\{\s*[a-zA-Z][\w-]*\s*\}\})/g;

  const segments = $derived(
    value.split(FIELD).map((part) => {
      const match = part.match(/^\{\{\s*([a-zA-Z][\w-]*)\s*\}\}$/);
      return match ? { field: match[1] } : { text: part };
    })
  );

  async function startEditing(selectAll = false) {
    if (readonly || editing) return;
    editing = true;
    await tick();
    if (!el) return;
    el.innerText = value;
    el.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(el);
    if (!selectAll) range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  $effect(() => {
    if (focusKey && (activeFocusKey === focusKey || activeFocusKey === `${focusKey}|all`)) {
      startEditing(activeFocusKey.endsWith("|all"));
      onfocused?.();
    }
  });

  function onkeydown(event: KeyboardEvent) {
    const empty = (event.currentTarget as HTMLElement).innerText.replace(/\n/g, "") === "";
    if (event.key === "Enter" && (!multiline || onenter) && !event.shiftKey) {
      event.preventDefault();
      onenter?.();
    } else if (event.key === "Backspace" && empty && onbackspaceempty) {
      event.preventDefault();
      onbackspaceempty();
    } else if (event.key === "/" && empty && onslash) {
      event.preventDefault();
      onslash();
    } else if (event.key === "Escape") {
      (event.currentTarget as HTMLElement).blur();
    }
  }
</script>

{#if editing}
  <div
    bind:this={el}
    contenteditable="plaintext-only"
    role="textbox"
    tabindex="0"
    aria-label={label ?? placeholder}
    aria-multiline={multiline}
    data-placeholder={placeholder}
    class={cn("cp-editable", className)}
    {style}
    oninput={(e) => onchange?.(e.currentTarget.innerText.replace(/\n$/, ""))}
    onblur={() => (editing = false)}
    {onkeydown}
  ></div>
{:else if readonly}
  <div class={cn("cp-text", className)} {style}>{@render content()}</div>
{:else}
  <div
    role="textbox"
    tabindex="0"
    aria-label={label ?? placeholder}
    aria-multiline={multiline}
    class={cn("cp-text", !value && "cp-empty", !value && optional && "cp-optional", className)}
    data-placeholder={placeholder}
    {style}
    onclick={() => startEditing()}
    onfocus={() => startEditing()}
    onkeydown={(e) => {
      if (e.key === "Enter") startEditing();
    }}
  >
    {@render content()}
  </div>
{/if}

{#snippet content()}
    {#each segments as segment, i (i)}
      {#if segment.field !== undefined}
        {@const filled = showValues && !RESERVED_FIELDS.has(segment.field) ? data[segment.field]?.trim() : ""}
        {#if filled}
          <span class="cp-field-filled">{filled}</span>
        {:else}
          <span class="cp-field" title={`Field: ${segment.field}`}>{fieldLabel(segment.field)}</span>
        {/if}
      {:else if rich}
        {#each parseInline(segment.text ?? "") as run, j (j)}
          {#if run.bold}<strong>{run.text}</strong>{:else if run.italic}<em>{run.text}</em>{:else}{run.text}{/if}
        {/each}
      {:else}
        {segment.text}
      {/if}
    {/each}
{/snippet}
