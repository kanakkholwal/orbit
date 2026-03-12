import { isTauriApp } from '$lib/runtime/isTauri';

export const appState = $state({
	isTauri: false,
	init: async () => {
		appState.isTauri = await isTauriApp();
	}
});
