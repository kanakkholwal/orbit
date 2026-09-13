<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import { cn } from "$lib/utils";
  import { IconEye as Eye, IconEyeOff as EyeOff, IconLock as Lock } from "@tabler/icons-svelte";

  type Props = {
    fileName: string;
    error?: string;
    busy?: boolean;
    onsubmit: (password: string) => void;
    oncancel?: () => void;
    class?: string;
  };

  let { fileName, error = "", busy = false, onsubmit, oncancel, class: className }: Props = $props();

  const uid = $props.id();
  let password = $state("");
  let showPassword = $state(false);
  let input = $state<HTMLInputElement | null>(null);

  $effect(() => {
    input?.focus();
  });

  $effect(() => {
    if (!error || !input) return;
    input.focus();
    input.select();
  });

  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (password && !busy) onsubmit(password);
  }
</script>

<form
  class={cn("flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5", className)}
  onsubmit={submit}
  aria-busy={busy}
>
  <div class="flex items-start gap-3">
    <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <Lock class="size-5" />
    </span>
    <div class="flex min-w-0 flex-col gap-0.5">
      <h2 class="truncate text-body-lg font-medium text-foreground" title={fileName}>{fileName}</h2>
      <p class="text-body text-muted-foreground">
        This PDF is locked. Enter its password to open it here. The password is used only on this device.
      </p>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <Label for="{uid}-password">Password</Label>
    <div class="relative">
      <Input
        bind:ref={input}
        id="{uid}-password"
        type={showPassword ? "text" : "password"}
        autocomplete="current-password"
        bind:value={password}
        disabled={busy}
        aria-invalid={error !== ""}
        aria-describedby={error ? `${uid}-password-error` : undefined}
        class="pr-11"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        onclick={() => (showPassword = !showPassword)}
      >
        {#if showPassword}<EyeOff />{:else}<Eye />{/if}
      </Button>
    </div>
    <p id="{uid}-password-error" class="text-caption text-destructive empty:hidden" aria-live="polite">{error}</p>
  </div>

  <div class="flex flex-wrap justify-end gap-2">
    {#if oncancel}
      <Button type="button" variant="ghost" onclick={oncancel} disabled={busy}>Choose another file</Button>
    {/if}
    <Button type="submit" variant="primary" disabled={busy || !password}>
      {busy ? "Unlocking…" : "Unlock"}
    </Button>
  </div>
</form>
