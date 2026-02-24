import type { PageServerLoad } from './$types';


export const ssr = false;

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  // Cache this response in the browser/CDN for 1 hour to prevent GitHub API rate limits
  setHeaders({
    'Cache-Control': 'public, max-age=3600'
  });

  try {
    const response = await fetch('https://api.github.com/repos/kanakkholwal/orbit/releases/latest');
    
    if (!response.ok) throw new Error('Failed to fetch release');
    
    const release = await response.json();
    const version = release.tag_name; // e.g., "v1.0.0"

    // Extract the specific assets Tauri generated
    const windowsAsset = release.assets.find((a: any) => a.name.endsWith('.msi') || a.name.endsWith('.exe'));
    const linuxAppImage = release.assets.find((a: any) => a.name.endsWith('.AppImage'));
    const linuxDeb = release.assets.find((a: any) => a.name.endsWith('.deb'));
    return {
      version,
      downloads: {
        windows: windowsAsset?.browser_download_url,
        linuxAppImage: linuxAppImage?.browser_download_url,
        linuxDeb: linuxDeb?.browser_download_url
      }
    };
  } catch (error) {
    // Fallback if the API fails or you haven't published a release yet
    return {
      version: 'Latest',
      downloads: { windows: '#', linuxAppImage: '#', linuxDeb: '#' }
    };
  }
};