import { getContext, setContext } from "svelte";

const KEY = Symbol("accordion-item");

/** The ids that tie an item's trigger and panel together (aria-controls, aria-labelledby). */
export type AccordionItemIds = { trigger: string; content: string };

export const setAccordionItem = (ids: AccordionItemIds) => setContext(KEY, ids);
export const accordionItem = (): AccordionItemIds | undefined => getContext(KEY);
