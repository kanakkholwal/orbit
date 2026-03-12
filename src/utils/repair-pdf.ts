
import {
    initializeQpdf,
    readFileAsArrayBuffer
} from '$utils/helper';

export async function repairPdfFile(file: File): Promise<Uint8Array | null> {
    const inputPath = '/input.pdf';
    const outputPath = '/repaired_form.pdf';
    let qpdf: any;

    try {
        qpdf = await initializeQpdf();
        const fileBuffer = await readFileAsArrayBuffer(file);
        const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

        qpdf.FS.writeFile(inputPath, uint8Array);

        const args = [inputPath, '--decrypt', outputPath];

        try {
            qpdf.callMain(args);
        } catch (e) {
            console.warn(`QPDF execution warning for ${file.name}:`, e);
        }

        let repairedData: Uint8Array | null = null;
        try {
            repairedData = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
        } catch (e) {
            console.warn(`Failed to read output for ${file.name}:`, e);
        }

        try {
            try {
                qpdf.FS.unlink(inputPath);
            } catch (e) {
                console.warn(e);
            }
            try {
                qpdf.FS.unlink(outputPath);
            } catch (e) {
                console.warn(e);
            }
        } catch (cleanupError) {
            console.warn('Cleanup error:', cleanupError);
        }

        return repairedData;

    } catch (error) {
        console.error(`Error repairing ${file.name}:`, error);
        return null;
    }
}
