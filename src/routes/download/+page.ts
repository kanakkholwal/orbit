import type { PageLoad } from "./$types";

type Asset = { url: string; size: number };

export interface Downloads {
  windowsMsi: Asset | null;
  windowsExe: Asset | null;
  macosIntel: Asset | null;
  macosAppleSilicon: Asset | null;
  linuxAppImage: Asset | null;
  linuxDeb: Asset | null;
  linuxRpm: Asset | null;
}

const EMPTY: Downloads = {
  windowsMsi: null,
  windowsExe: null,
  macosIntel: null,
  macosAppleSilicon: null,
  linuxAppImage: null,
  linuxDeb: null,
  linuxRpm: null,
};

export const load: PageLoad = async ({ fetch, setHeaders }) => {
  // One hour of caching keeps the page clear of GitHub's API rate limit.
  setHeaders({ "Cache-Control": "public, max-age=3600" });

  try {
    const response = await fetch("https://api.github.com/repos/kanakkholwal/orbit/releases/latest");
    if (!response.ok) throw new Error("Failed to fetch release");

    const release = await response.json();
    const assets: { name: string; browser_download_url: string; size: number }[] = release.assets;
    const find = (test: (name: string) => boolean): Asset | null => {
      const asset = assets.find((a) => !a.name.endsWith(".sig") && test(a.name));
      return asset ? { url: asset.browser_download_url, size: asset.size } : null;
    };

    const downloads: Downloads = {
      windowsMsi: find((n) => n.endsWith(".msi")),
      windowsExe: find((n) => n.endsWith(".exe")),
      macosIntel: find((n) => n.includes("x64") && n.endsWith(".dmg")),
      macosAppleSilicon: find((n) => n.includes("aarch64") && n.endsWith(".dmg")),
      linuxAppImage: find((n) => n.endsWith(".AppImage")),
      linuxDeb: find((n) => n.endsWith(".deb")),
      linuxRpm: find((n) => n.endsWith(".rpm")),
    };

    return {
      version: release.tag_name as string,
      published: (release.published_at as string | null) ?? null,
      releaseUrl: (release.html_url as string | null) ?? "https://github.com/kanakkholwal/orbit/releases",
      downloads,
    };
  } catch {
    return {
      version: "Latest",
      published: null as string | null,
      releaseUrl: "https://github.com/kanakkholwal/orbit/releases",
      downloads: EMPTY,
    };
  }
};
