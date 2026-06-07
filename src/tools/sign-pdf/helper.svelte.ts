import { PdfEngine } from '$lib/pdf-engine.svelte';
import { generateSelfSignedP12, signPdfDigital } from '$utils/pdf-sign';
import { toast } from 'svelte-sonner';

export type CertMode = 'upload' | 'generate';

export class SignPdfState extends PdfEngine {
    fileName = $state('document');
    pdfBytes = $state<Uint8Array | null>(null);

    certMode = $state<CertMode>('upload');
    p12Bytes = $state<Uint8Array | null>(null);
    p12Name = $state('');
    passphrase = $state('');

    // Self-signed generator fields
    genName = $state('');
    genOrg = $state('');
    genCountry = $state('');
    generating = $state(false);

    // Signature metadata
    reason = $state('I approve this document');
    location = $state('');
    contactInfo = $state('');

    get hasPdf(): boolean {
        return this.pdfBytes !== null;
    }
    get hasCert(): boolean {
        return this.p12Bytes !== null;
    }
    get canSign(): boolean {
        return this.hasPdf && this.hasCert && this.passphrase.length > 0 && !this.isProcessing;
    }

    async loadFile(file: File) {
        if (!file) return;
        this.fileName = file.name.replace(/\.pdf$/i, '') || 'document';
        this.pdfBytes = new Uint8Array(await file.arrayBuffer());
    }

    async loadCert(file: File) {
        if (!file) return;
        this.p12Bytes = new Uint8Array(await file.arrayBuffer());
        this.p12Name = file.name;
        toast.success('Certificate loaded.');
    }

    async generateCert() {
        if (!this.genName.trim()) {
            toast.error('Enter a name for the certificate.');
            return;
        }
        if (this.passphrase.length < 4) {
            toast.error('Set a passphrase of at least 4 characters.');
            return;
        }
        this.generating = true;
        try {
            this.p12Bytes = await generateSelfSignedP12({
                name: this.genName.trim(),
                organization: this.genOrg.trim() || undefined,
                country: this.genCountry.trim() || undefined,
                passphrase: this.passphrase
            });
            this.p12Name = `${this.genName.trim()} (self-signed)`;
            if (!this.contactInfo && this.genName) this.contactInfo = this.genName.trim();
            toast.success('Self-signed certificate created.');
        } catch (e) {
            console.error('cert gen:', e);
            toast.error('Failed to generate certificate.');
        } finally {
            this.generating = false;
        }
    }

    /** Download the generated certificate so the user can reuse it. */
    downloadCert() {
        if (!this.p12Bytes) return;
        const blob = new Blob([this.p12Bytes as BlobPart], { type: 'application/x-pkcs12' });
        this.downloadBlob(blob, `${(this.genName || 'certificate').trim()}.p12`);
    }

    async sign() {
        if (!this.pdfBytes || !this.p12Bytes) return;
        await this.handleProcess(
            async () => {
                const signed = await signPdfDigital(this.pdfBytes!, this.p12Bytes!, {
                    passphrase: this.passphrase,
                    reason: this.reason,
                    location: this.location,
                    name: this.genName || this.contactInfo,
                    contactInfo: this.contactInfo
                });
                const blob = new Blob([signed as BlobPart], { type: 'application/pdf' });
                this.downloadBlob(blob, `${this.fileName}_signed.pdf`);
            },
            {
                loading: 'Signing…',
                success: 'PDF signed.',
                error: (e) =>
                    /password|passphrase|mac/i.test(e?.message ?? '')
                        ? 'Wrong certificate passphrase.'
                        : 'Failed to sign the PDF.'
            }
        );
    }

    reset() {
        this.pdfBytes = null;
        this.p12Bytes = null;
        this.p12Name = '';
        this.passphrase = '';
        this.fileName = 'document';
        this.genName = '';
        this.genOrg = '';
        this.genCountry = '';
    }
}
