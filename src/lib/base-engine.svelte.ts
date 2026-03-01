import { toast } from 'svelte-sonner';
import { downloadBlobFile } from './download';
export interface ProgressState {
    current: number;
    total: number;
    text: string;
}

export class BaseEngine {
    // Shared State
    isProcessing = $state(false);
    progress = $state<ProgressState>({ current: 0, total: 0, text: '' });
    /**
     * Standardized runner for async tasks with toast notifications.
     */
    protected async handleProcess<T>(
        task: () => Promise<T>,
        options: {
            loading?: string;
            success?: string;
            error?: string | ((err: any) => string);
        } = {}
    ) {
        const {
            loading = 'Processing...',
            success = 'Task completed successfully!',
            error = 'An error occurred during processing.'
        } = options;

        this.isProcessing = true;
        try {
            const result = await toast.promise(task(), {
                loading,
                success,
                error
            });
            return result;
        } catch (err) {
            const errorMessage = typeof error === 'function' ? error(err) : error;
            toast.error(errorMessage);
            throw err;
        } finally {
            this.isProcessing = false;
        }
    }
    /**
 * Shared logic to trigger a file download in the browser and Native environments.
 */
    protected downloadBlob(blob: Blob, fileName: string) {
        try {
            downloadBlobFile(blob, fileName);
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file. Please try again.");
        }
    }
}