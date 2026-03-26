# MSIX Build Guide for Windows

This guide explains how to build MSIX (Modern Install, eXtensible) packages for distributing your Orbit PDF application on Windows.

## What is MSIX?

MSIX is Microsoft's modern app packaging format for Windows. It provides:
- ✅ **Microsoft Store Distribution** - Easy distribution through Microsoft Store
- ✅ **Auto-Updates** - Built-in update mechanism
- ✅ **Security** - Code signing and integrity verification
- ✅ **Clean Installation** - No registry pollution
- ✅ **Professional Appearance** - Modern install experience

## Prerequisites

### 1. Install Required Tools

```powershell
# Install Windows App SDK (required for MSIX)
# Download from: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/downloads
# Or use winget:
winget install Microsoft.WindowsAppSDK

# Ensure you have Rust and Cargo
rustup update
```

### 2. Code Signing Certificate (Production)

For production builds, you'll need a code signing certificate:

```powershell
# Option A: Use a commercial certificate (recommended for distribution)
# - Buy from: DigiCert, Sectigo, or similar
# - Export as .pfx file

# Option B: Create a self-signed certificate (testing only)
New-SelfSignedCertificate -Type Custom `
  -Subject "CN=Nexonauts, O=Nexonauts, C=US" `
  -KeyUsage DigitalSignature `
  -FriendlyName "Orbit PDF Certificate" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}CA=0&pathlength=3") `
  -NotAfter (Get-Date).AddYears(10)
```

## Building MSIX

### Option 1: Building with Tauri CLI (Recommended)

```powershell
# Navigate to project root
cd "c:\Users\kanak\Coding\projects\personal\orbit"

# Build for Windows (includes MSIX and other installers)
bun run tauri:build

# Or specifically build just the app
cargo tauri build --target x86_64-pc-windows-msvc --bundles msi,nsis
```

The output will be in:
```
src-tauri/target/release/bundle/
├── msi/           # MSI installer
├── nsis/          # NSIS installer
└── updater/       # Update artifacts
```

### Option 2: Manual MSIX Creation (Advanced)

If you need more control, you can use the MSIX Packaging Tool:

```powershell
# Download MSIX Packaging Tool from Microsoft Store
# Or from: https://learn.microsoft.com/en-us/windows/msix/packaging-tool/tool-overview

# Launch the tool
Start-Process "C:\Program Files (x86)\MSIX Packaging Tool\MSIX Packaging Tool.exe"
```

Then:
1. Select "Application Package"
2. Choose your installer (MSI/NSIS output)
3. Configure package information
4. Sign the package
5. Create MSIX

## Configuration for MSIX

Your `tauri.conf.json` is configured with:

```json
"bundle": {
  "targets": ["msi", "nsis", "appimage", "deb", "dmg"],
  "windows": {
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.digicert.com"
  }
}
```

### Key Settings Explained

- **targets**: Specifies output formats. `msi` is the base for MSIX conversion
- **digestAlgorithm**: "sha256" for modern code signing
- **timestampUrl**: Ensures signatures don't expire with certificate

## Code Signing

### Production Signing

```powershell
# Set your certificate path and password
$cert = Get-PfxCertificate -FilePath "path/to/certificate.pfx"

# Tauri will automatically sign binaries if found in:
# - Windows certificate store
# - Specified in environment variable

# Option: Set via environment
$env:TAURI_SIGNING_CERTIFICATE = "path/to/certificate.pfx"
$env:TAURI_SIGNING_CERTIFICATE_PASSWORD = "your-password"

# Then build
bun run tauri:build
```

### Self-Signed Testing

```powershell
# Tauri will use your self-signed cert if installed in Windows cert store
# No additional configuration needed
bun run tauri:build
```

## Customizing App Details for MSIX

Edit `src-tauri/tauri.conf.json`:

```json
{
  "productName": "Orbit PDF",
  "version": "0.1.0",
  "identifier": "com.nexonauts.orbit",
  "build": {
    "beforeBuildCommand": "cross-env BUILD_TARGET=tauri bun run build"
  }
}
```

Important fields:
- **productName**: Appears in Windows Add/Remove Programs
- **version**: Increment for updates (semantic versioning)
- **identifier**: Must be unique (reverse domain notation)

## Building Release Notes

Create `RELEASE_NOTES.md` in project root:

```markdown
## Version 0.1.0

### New Features
- Initial release
- PDF manipulation tools
- Offline-first architecture
- PWA support

### Bug Fixes
- Various stability improvements

### Known Issues
- None at this time
```

## Distribution Channels

### 1. **Microsoft Store**
- Highest security and distribution
- Automatic updates
- Largest audience

Process:
1. Create Microsoft Developer account
2. Reserve app name
3. Submit MSIX to store
4. Follow certification requirements

### 2. **Direct Download (Your Website)**
```
orbit-0.1.0-x64.msi
orbit-0.1.0.exe (NSIS)
```

### 3. **GitHub Releases**
```powershell
# Upload the following to GitHub Releases:
# - *.msi files
# - *.exe (NSIS) files
# - updater artifacts
```

## Testing Your Build

```powershell
# List generated artifacts
Get-ChildItem "src-tauri/target/release/bundle/"

# Test install MSI
msiexec /i "path/to/orbit-0.1.0-x64.msi"

# Test NSIS installer
& "path/to/Orbit PDF_0.1.0_x64_en-US.exe"

# Check installation
Get-Command orbit
Get-ChildItem "C:\Program Files\Orbit PDF"
```

## Troubleshooting

### Build fails with "Signature algorithm not supported"

Update your signing configuration:
```json
"windows": {
  "digestAlgorithm": "sha256"
}
```

### MSIX conversion fails

The NSIS/MSI output is converted to MSIX. If conversion fails:
1. Ensure Windows App SDK is installed
2. Check event logs: `Event Viewer > Windows Logs > Application`
3. Try MSIX Packaging Tool for manual conversion

### App doesn't appear in Windows Store

Check:
- Identity in manifest matches Windows Store submission
- Version is incremented
- Icons meet size requirements (at least 512x512)

## Advanced: AppX Manifest Customization

For full MSIX control, you can customize `AppxManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10">
  <Identity Name="NexonautsOrbitPDF" Publisher="CN=Nexonauts" Version="0.1.0.0" />
  <Properties>
    <DisplayName>Orbit PDF</DisplayName>
    <PublisherDisplayName>Nexonauts</PublisherDisplayName>
  </Properties>
</Package>
```

## Useful Resources

- [Tauri MSI Guide](https://tauri.app/v1/guides/building/windows/)
- [MSIX Documentation](https://learn.microsoft.com/en-us/windows/msix/)
- [Code Signing Guide](https://learn.microsoft.com/en-us/windows/win32/seccrypto/authenticode)
- [Windows Store Publishing](https://learn.microsoft.com/en-us/windows/msix/package/packaging-uwp-apps)

## Next Steps

1. ✅ Build your first release: `bun run tauri:build`
2. ✅ Test the installer locally
3. ✅ Obtain code signing certificate
4. ✅ Sign production builds
5. ✅ Submit to Microsoft Store (optional)
6. ✅ Set up auto-updates via GitHub releases
