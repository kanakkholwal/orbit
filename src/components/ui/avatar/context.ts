import { createContext } from "svelte";

export type AvatarContext = {
	readonly status: "loading" | "loaded" | "error";
};

export const [getAvatar, setAvatar] = createContext<AvatarContext>();
