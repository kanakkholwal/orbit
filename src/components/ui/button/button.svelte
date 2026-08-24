<script lang="ts" module>
  import { cn, type WithElementRef } from "$lib/utils.js";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
  import { tv, type VariantProps } from "tailwind-variants";

  export const buttonVariants = tv({
    base: "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-[160ms] ease-snappy active:scale-[0.98] active:duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    variants: {
      variant: {
        default:
          "bg-action text-action-foreground shadow-subtle hover:opacity-90",
        primary:
          "bg-primary text-primary-foreground shadow-subtle hover:bg-primary-active",
        default_soft:
          "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:text-primary hover:dark:bg-primary/5 hover:dark:text-primary",
        brand:
          "bg-brand text-primary-foreground shadow-brand hover:brightness-[1.05] active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-subtle hover:opacity-90",
        destructive_soft:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline:
          "border border-border bg-card text-foreground shadow-subtle hover:bg-paper",
        secondary:
          "bg-paper text-foreground hover:bg-border",
        ghost: "text-foreground hover:bg-paper",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "bg-action text-action-foreground shadow-subtle hover:opacity-90",
        // The primary action on .band-dark. Fixed values: the band does not
        // flip the theme, so bg-dark there would render near-black on near-black.
        light: "bg-fixed-light text-fixed-dark shadow-subtle hover:opacity-90",
        raw: "",
      },
      size: {
        default: "h-10 px-5 py-2.5 [&>svg]:size-5",
        xs: "h-7 px-4 py-2 [&>svg]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs font-medium [&>svg]:size-4",
        lg: "h-11 rounded-md px-6 [&>svg]:size-5",
        xl: "h-12 rounded-md px-8 [&>svg]:size-6 text-lg font-medium",
        icon: "size-10 [&>svg]:size-5",
        "icon-xs": "size-6 rounded-sm [&>svg]:size-3",
        "icon-sm": "size-8 [&>svg]:size-4",
        "icon-lg": "size-12 [&>svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });
  export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  export type ButtonSize = VariantProps<typeof buttonVariants>["size"];
  export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      variant?: ButtonVariant;
      size?: ButtonSize;
    };
</script>

<script lang="ts">
  let {
    class: className,
    variant = "default",
    size = "default",
    ref = $bindable(null),
    href = undefined,
    type = "button",
    disabled,
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <a
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    role={disabled ? "link" : undefined}
    tabindex={disabled ? -1 : undefined}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
