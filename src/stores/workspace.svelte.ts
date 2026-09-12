import { browser } from "$app/environment";
import type { Snippet } from "svelte";

const PANEL_KEY = "orbit:tools-panel";

export type ShellSlot = { title: string; content: Snippet };

class WorkspaceShell {
	panelPinned = $state(true);
	panelDrawerOpen = $state(false);
	inspectorDrawerOpen = $state(false);
	searchOpen = $state(false);
	inspector = $state.raw<ShellSlot | null>(null);
	actionBar = $state.raw<Snippet | null>(null);

	constructor() {
		if (!browser) return;
		try {
			this.panelPinned = localStorage.getItem(PANEL_KEY) !== "collapsed";
		} catch {
			this.panelPinned = true;
		}
	}

	/** Pins or unpins the inline panel on wide screens; opens the drawer below that. */
	togglePanel(wide: boolean) {
		if (!wide) {
			this.panelDrawerOpen = !this.panelDrawerOpen;
			return;
		}
		this.panelPinned = !this.panelPinned;
		try {
			localStorage.setItem(
				PANEL_KEY,
				this.panelPinned ? "pinned" : "collapsed",
			);
		} catch {
			return;
		}
	}

	closeDrawers() {
		this.panelDrawerOpen = false;
		this.inspectorDrawerOpen = false;
	}
}

export const workspace = new WorkspaceShell();
