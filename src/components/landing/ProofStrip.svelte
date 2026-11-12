<script lang="ts">
  import { RollingDigits } from "$components/text/rolling-digits";
  import { toolList } from "$tools/list";

  const total = toolList.filter((t) => !t.alias).length;
  const stats = [
    { value: total, label: "tools in one place", suffix: "" },
    { value: 0, label: "files uploaded, ever", suffix: "" },
    { value: 100, label: "percent runs on your device", suffix: "%" },
    { value: 0, label: "accounts, watermarks or limits", suffix: "" },
  ];
</script>

<dl class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
  {#each stats as s (s.label)}
    <div class="flex flex-col gap-1 bg-card p-5 md:p-6">
      <dd class="flex items-baseline text-4xl font-medium tabular-nums text-foreground md:text-5xl">
        <RollingDigits value={s.value} />{s.suffix}
      </dd>
      <dt class="text-sm text-muted-foreground">{s.label}</dt>
    </div>
  {/each}
</dl>
