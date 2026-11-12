<script lang="ts">
  import { IconCloudUpload as Upload, IconSettings as Settings, IconDownload as Download } from "$lib/icons";

  const steps = [
    { icon: Upload, title: "Pick a tool and add your file", body: "Drop it in, choose it from your device, or paste a screenshot. The file is opened locally." },
    { icon: Settings, title: "Set what you need", body: "Choose a preset such as a passport photo or a 100 KB limit, or enter your own size and quality." },
    { icon: Download, title: "Save the result", body: "Check the before and after, then save. Nothing was uploaded, and it all works offline once loaded." },
  ];
</script>

<ol class="grid grid-cols-1 gap-3 md:grid-cols-3">
  {#each steps as step, i (step.title)}
    <li class="rise rounded-2xl border border-border bg-background p-1" style:--i={i + 1}>
      <div class="flex h-full flex-col gap-4 rounded-[11px] bg-card p-5">
        <div class="flex items-center justify-between">
          <span class="grid size-10 place-items-center rounded-xl border border-border bg-background text-primary">
            <step.icon class="size-5" />
          </span>
          <span class="font-mono text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-medium text-foreground">{step.title}</h3>
          <p class="text-pretty text-sm text-muted-foreground">{step.body}</p>
        </div>
      </div>
    </li>
  {/each}
</ol>
