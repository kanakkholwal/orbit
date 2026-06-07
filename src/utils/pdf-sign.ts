/**
 * Client-side PDF digital signing (PAdES-B-B) and self-signed certificate
 * generation — all in the browser, nothing uploaded.
 *
 * The cryptographic signature (a PKCS#7/CMS container embedded in the PDF) is
 * produced locally with node-forge via @signpdf. This is the tamper-evident,
 * certificate-based signature that paid tools gate behind a subscription.
 *
 * Trusted timestamps (PAdES-B-T) and long-term validation need a Time-Stamping
 * Authority, which a browser can't reach directly — see `proxy-url.ts` and the
 * Cloudflare timestamp proxy. That is an optional, separately-disclosed step;
 * the signature here is complete and verifiable on its own.
 */

export interface DigitalSignOptions {
    passphrase: string;
    reason?: string;
    name?: string;
    location?: string;
    contactInfo?: string;
}

async function toNodeBuffer(data: Uint8Array): Promise<Buffer> {
    // Polyfill Node's Buffer for @signpdf, which expects it, in the browser.
    const { Buffer } = await import('buffer');
    if (typeof (globalThis as { Buffer?: unknown }).Buffer === 'undefined') {
        (globalThis as { Buffer?: unknown }).Buffer = Buffer;
    }
    return Buffer.from(data);
}

/** Sign a PDF with a PKCS#12 (.p12/.pfx) certificate. Returns the signed PDF. */
export async function signPdfDigital(
    pdfBytes: Uint8Array,
    p12Bytes: Uint8Array,
    options: DigitalSignOptions
): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib');
    const { pdflibAddPlaceholder } = await import('@signpdf/placeholder-pdf-lib');
    const signpdf = (await import('@signpdf/signpdf')).default;
    const { P12Signer } = await import('@signpdf/signer-p12');

    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    pdflibAddPlaceholder({
        pdfDoc,
        reason: options.reason || 'Signed with Orbit',
        contactInfo: options.contactInfo || '',
        name: options.name || '',
        location: options.location || ''
    });

    const withPlaceholder = await pdfDoc.save({ useObjectStreams: false });
    const signer = new P12Signer(await toNodeBuffer(p12Bytes), {
        passphrase: options.passphrase
    });

    const signed = await signpdf.sign(await toNodeBuffer(withPlaceholder), signer);
    return new Uint8Array(signed);
}

export interface SelfSignedOptions {
    name: string;
    passphrase: string;
    organization?: string;
    country?: string;
    years?: number;
}

/**
 * Generate a self-signed PKCS#12 certificate in the browser for users who don't
 * have one. A self-signed cert is not issued by a trusted CA, so validators show
 * "validity unknown / not trusted" — but the signature is still cryptographically
 * tamper-evident: any change to the document after signing is detectable.
 */
export async function generateSelfSignedP12(options: SelfSignedOptions): Promise<Uint8Array> {
    const forge = (await import('node-forge')).default;

    const keys = await new Promise<import('node-forge').pki.rsa.KeyPair>((resolve, reject) => {
        forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
            if (err) reject(err);
            else resolve(keypair);
        });
    });

    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    const notAfter = new Date();
    notAfter.setFullYear(notAfter.getFullYear() + (options.years ?? 5));
    cert.validity.notAfter = notAfter;

    const attrs: import('node-forge').pki.CertificateField[] = [
        { name: 'commonName', value: options.name }
    ];
    if (options.organization) attrs.push({ name: 'organizationName', value: options.organization });
    if (options.country) attrs.push({ name: 'countryName', value: options.country });

    cert.setSubject(attrs);
    cert.setIssuer(attrs); // self-signed: subject == issuer
    cert.setExtensions([
        { name: 'basicConstraints', cA: false },
        { name: 'keyUsage', digitalSignature: true, nonRepudiation: true },
        { name: 'extKeyUsage', emailProtection: true, clientAuth: true }
    ]);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], options.passphrase, {
        algorithm: '3des'
    });
    const der = forge.asn1.toDer(p12Asn1).getBytes();

    const out = new Uint8Array(der.length);
    for (let i = 0; i < der.length; i++) out[i] = der.charCodeAt(i) & 0xff;
    return out;
}
