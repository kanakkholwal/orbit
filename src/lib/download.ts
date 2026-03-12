import { trackFileDownload } from "$lib/analytics-tracker";
import { isTauriApp } from "$lib/runtime/isTauri";

export async function downloadBlobFile(blob: Blob, fileName: string) {
    if (await isTauriApp()) {
        return downloadBlobTauri(blob, fileName)
    }

    return downloadBlobWeb(blob, fileName)
}

//  Browser  

function downloadBlobWeb(blob: Blob, fileName: string) {
    // Track download event in Google Analytics
    trackFileDownload(fileName, blob.size, 'web');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

//  TAURI - desktop & mobile

async function downloadBlobTauri(blob: Blob, fileName: string) {
    const [{ save }, { writeFile }] = await Promise.all([
        import("@tauri-apps/plugin-dialog"),
        import("@tauri-apps/plugin-fs")
    ])

    const filePath = await save({
        defaultPath: fileName
    })

    if (!filePath) return

    const bytes = new Uint8Array(await blob.arrayBuffer())

    await writeFile(filePath, bytes)
}