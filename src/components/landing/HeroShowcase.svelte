<script lang="ts">
  import { Badge } from "$components/ui/badge";
  import {
    IconArrowDown as Down,
    IconArrowRight as ArrowRight,
    IconFileText as FileText,
    IconId as IdIcon,
    IconPlayerPlay as Play,
    IconShieldCheck as Shield,
  } from "$lib/icons";

  const jobs = [
    { icon: IdIcon, from: "passport.heic", to: "35 × 45 mm, 300 dpi", result: "42 KB", note: "under 50 KB", offset: "" },
    { icon: Play, from: "clip.mov", to: "clip.mp4, 720p", result: "71% smaller", note: "11.4 MB to 3.3 MB", offset: "md:ml-8" },
    { icon: FileText, from: "form.pdf", to: "compressed", result: "187 KB", note: "under 200 KB", offset: "md:ml-16" },
  ];
</script>

<div class="flex w-full max-w-md flex-col gap-3" aria-label="Examples of finished jobs">
  {#each jobs as job, i (job.from)}
    <div class="rise rounded-2xl border border-border bg-background p-1 {job.offset}" style:--i={i + 2}>
      <div class="flex items-center gap-3 rounded-xl bg-card p-3.5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-primary">
          <job.icon class="size-5" />
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
            {job.from}
            <ArrowRight class="size-3 shrink-0 text-muted-foreground" />
          </span>
          <span class="truncate text-xs text-muted-foreground">{job.to}</span>
        </span>
        <span class="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="success"><Down class="size-3.5" />{job.result}</Badge>
          <span class="text-xs tabular-nums text-muted-foreground">{job.note}</span>
        </span>
      </div>
    </div>
  {/each}

  <p class="rise flex items-center gap-2 pl-1 pt-1 text-sm text-muted-foreground md:ml-16" style="--i:5">
    <Shield class="size-4 text-primary" />
    Done on this device. Nothing uploaded.
  </p>
</div>
