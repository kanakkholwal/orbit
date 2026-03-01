<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Command from "$components/ui/command/index.js";
  import * as Dialog from "$components/ui/dialog/index.js";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import { ChevronRight, FileText, Github, Search } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { Button } from "./ui/button";

  interface CommandItem {
    id: string;
    title: string;
    description?: string;
    category: string;
    action: () => void;
    icon?: any;
    keywords?: string[];
    color?: string;
  }

  let open = $state(false);
  let searchValue = $state("");
  let selectedIndex = $state(0);
  let filteredCommands = $state<CommandItem[]>([]);
  let { iconOnly } = $props<{ iconOnly?: boolean }>();

  // PDF Tool commands - customize these based on your actual tools
  const commands: CommandItem[] = [
    ...toolList.map((tool) => ({
      id: tool.slug,
      title: tool.title,
      description: tool.description.split(". ")[0] + ".",
      category: tool.category,
      action: () => {
        goto(`/tools/${tool.slug}`);
      },
      icon: tool.icon || FileText,
      color: tool.color,
      keywords: [tool.title, ...(tool.keywords || [])],
    })),
    {
      id: "home",
      title: "Go to Home",
      description: "Navigate back to the homepage.",
      category: "Navigation",
      action: () => {
        goto("/");
      },
      icon: ChevronRight,
      keywords: ["home", "main page", "dashboard"],
    },
    {
      id: "github",
      title: "View on GitHub",
      description: "Check out the source code on GitHub.",
      category: "External",
      action: () => {
        window.open(config.github, "_blank");
      },
      icon: Github,
      keywords: ["github", "source code", "repository"],
    },
    // ...( )Add more commands as needed
  ];

  function filterCommands(query: string) {
    if (!query.trim()) {
      filteredCommands = commands;
      return;
    }

    const lowerQuery = query.toLowerCase();
    filteredCommands = commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      const keywordsMatch = cmd.keywords?.some((kw) =>
        kw.toLowerCase().includes(lowerQuery),
      );
      return titleMatch || descMatch || keywordsMatch;
    });

    selectedIndex = 0;
  }

  function handleClose() {
    open = false;
    searchValue = "";
    selectedIndex = 0;
  }

  function executeCommand(command: CommandItem) {
    command.action();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!open) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        open = true;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = Math.min(
          selectedIndex + 1,
          filteredCommands.length - 1,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
          handleClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    filterCommands("");

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  $effect(() => {
    filterCommands(searchValue);
  });

  // Group commands by category
  function groupedCommands() {
    const groups: { [key: string]: CommandItem[] } = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<Button
  onclick={() => (open = true)}
  aria-label="Open Command Menu"
  title="Open Command Menu (⌘K)"
  variant="outline"
  size={iconOnly ? "icon" : "default"}
  class={cn(
    "group relative group-data-[state=collapsed]:size-8",
    !iconOnly && "w-full max-w-xs",
  )}
>
  <Search
    class="size-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-70"
  />
  {#if !iconOnly}
    <span
      class="flex-1 text-left text-xs font-medium group-data-[state=collapsed]:hidden!"
      >Search tools...</span
    >
    <kbd
      class="group-data-[state=collapsed]:hidden! hidden items-center gap-1 rounded-md border border-border/40 bg-background/50 px-2 py-1 font-mono text-[11px] font-medium text-muted-foreground/70 backdrop-blur-sm sm:inline-flex"
    >
      <span class="text-xs font-semibold group-data-[state=collapsed]:hidden"
        >⌘</span
      >K
    </kbd>
  {/if}
</Button>

<Dialog.Root bind:open onOpenChange={(newOpen) => (open = newOpen)}>
  <Dialog.Content class="overflow-hidden p-0 shadow-2xl border-border/40">
    <Command.Root value={searchValue} onValueChange={(v) => (searchValue = v)}>
      <Command.Input
        bind:value={searchValue}
        placeholder="Search tools by name or function..."
        class="border-0"
      />

      <!-- Command List -->
      <Command.List>
        {#if filteredCommands.length === 0}
          <Command.Empty>
            <div class="text-sm text-muted-foreground">
              No commands found. Try a different search.
            </div>
          </Command.Empty>
        {:else}
          {#each Object.entries(groupedCommands()) as [category, categoryCommands]}
            <Command.Group heading={category}>
              {#each categoryCommands as command}
                {@const isSelected =
                  selectedIndex === filteredCommands.indexOf(command)}
                <Command.Item
                  value={command.id}
                  onSelect={() => executeCommand(command)}
                  class={cn(
                    isSelected && "aria-selected:bg-accent aria-selected:text-accent-foreground"
                  )}
                >
                  {#if command.icon}
                    {@const IconComponent = command.icon}
                    <IconComponent
                      class={cn(
                        "size-4 shrink-0",
                        command.color
                      )}
                    />
                  {/if}
                  <div class="flex flex-col flex-1 min-w-0 gap-0.5">
                    <span class="font-medium truncate">{command.title}</span>
                    {#if command.description}
                      <span class="text-xs text-muted-foreground truncate">
                        {command.description}
                      </span>
                    {/if}
                  </div>
                  {#if isSelected}
                    <ChevronRight class="size-4 shrink-0 opacity-60 ml-auto" />
                  {/if}
                </Command.Item>
              {/each}
            </Command.Group>
          {/each}
        {/if}
      </Command.List>

      <!-- Footer -->
      <div class="border-t bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <div class="flex items-center justify-between">
          <span
            >Press <kbd class="rounded bg-background px-1.5 py-0.5">Esc</kbd> to
            close</span
          >
          <span>
            <kbd class="rounded bg-background px-1 py-0.5">↑</kbd>
            <kbd class="rounded bg-background px-1 py-0.5 ml-1">↓</kbd>
            <span class="ml-1">to navigate</span>
          </span>
        </div>
      </div>
    </Command.Root>
  </Dialog.Content>
</Dialog.Root>

