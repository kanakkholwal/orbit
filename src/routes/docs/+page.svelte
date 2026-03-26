<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config, faqs } from "$constants/app";
  import { toolList } from "$tools/list";
  import {
    ArrowRight,
    BookOpen,
    Download,
    Github,
    Infinity,
    MonitorSmartphone,
    Shield,
    WifiOff,
    Zap,
  } from "@lucide/svelte";




</script>
<Seo
  title="Documentation & User Guide"
  description="Learn how to use our free, privacy-first PDF toolkit to manage your documents. Quick start guide, installation instructions, tool overviews, and FAQ."
  keywords={[
    "PDF tools documentation",
    "free PDF editor offline",
    "how to edit PDF locally",
    "PDF toolkit user guide",
    "open source PDF app",
  ]}
/>


<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <div
    class="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-16 pt-24 pb-20 md:pt-32 px-5 md:px-10"
  >
    <aside class="md:w-64 shrink-0">
      <div class="sticky top-28 space-y-8">
        <div>
          <h3
            class="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <BookOpen size={16} class="text-primary" />
            Quick Navigation
          </h3>
          <nav class="flex flex-col space-y-1.5">
            <a
              href="#getting-started"
              class="text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >Getting Started</a
            >
            <a
              href="#installation"
              class="text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >Installation</a
            >
            <a
              href="#available-tools"
              class="text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >Available Tools</a
            >
            <a
              href="#privacy-security"
              class="text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >Privacy & Security</a
            >
            <a
              href="#faq"
              class="text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >FAQ</a
            >
          </nav>
        </div>
      </div>
    </aside>

    <main class="flex-1 space-y-16">
      <header class="space-y-4 border-b border-border pb-10">
        <h1
          class="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground"
        >
          Documentation
        </h1>
        <p class="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to use our toolkit to manage, convert, and edit your PDF
          documents with complete privacy and offline control.
        </p>
      </header>

      <section id="getting-started" class="scroll-mt-32 space-y-6">
        <h2
          class="text-2xl font-bold text-foreground border-b border-border/50 pb-2"
        >
          Getting Started
        </h2>
        <p class="text-muted-foreground leading-relaxed">
          Our application is a powerful, privacy-first PDF toolkit that runs
          entirely on your device. No installation is required to start—just
          visit the web app and drop your files.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div
            class="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-3"
          >
            <Shield class="text-emerald-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h4 class="font-semibold text-foreground">100% Private</h4>
              <p class="text-sm text-muted-foreground mt-1">
                All processing happens on your device. No data is sent to
                servers.
              </p>
            </div>
          </div>
          <div
            class="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-3"
          >
            <Zap class="text-amber-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h4 class="font-semibold text-foreground">Lightning Fast</h4>
              <p class="text-sm text-muted-foreground mt-1">
                Powered by WebAssembly for native-speed desktop performance.
              </p>
            </div>
          </div>
          <div
            class="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-3"
          >
            <WifiOff class="text-sky-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h4 class="font-semibold text-foreground">Offline Ready</h4>
              <p class="text-sm text-muted-foreground mt-1">
                Works perfectly without an active internet connection.
              </p>
            </div>
          </div>
          <div
            class="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-3"
          >
            <Infinity class="text-indigo-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h4 class="font-semibold text-foreground">No Limits</h4>
              <p class="text-sm text-muted-foreground mt-1">
                Unlimited file sizes and completely free batch processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="installation" class="scroll-mt-32 space-y-6">
        <h2
          class="text-2xl font-bold text-foreground border-b border-border/50 pb-2"
        >
          Installation
        </h2>

        <div class="space-y-8">
          <div>
            <h3
              class="text-lg font-semibold text-foreground flex items-center gap-2 mb-3"
            >
              <MonitorSmartphone size={20} class="text-primary" /> Web App (No Installation)
            </h3>
            <p class="text-muted-foreground text-sm">
              Simply navigate to the home page and start using the tools
              immediately. Once the page loads, it acts as a Progressive Web App
              (PWA) and can be used offline.
            </p>
          </div>

          <div>
            <h3
              class="text-lg font-semibold text-foreground flex items-center gap-2 mb-3"
            >
              <Download size={20} class="text-primary" /> Desktop App (Windows, macOS,
              Linux)
            </h3>
            <ol
              class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-1"
            >
              <li>
                Go to our <a
                  href={config.github + "/releases"}
                  class="text-primary hover:underline font-medium"
                  >GitHub Releases</a
                > page.
              </li>
              <li>
                Download the installer for your operating system:
                <ul
                  class="list-disc list-inside ml-6 mt-2 space-y-1 text-muted-foreground/80"
                >
                  <li>
                    <strong>Windows:</strong> Download the
                    <code
                      class="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground"
                      >.msi</code
                    >
                    or
                    <code
                      class="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground"
                      >.exe</code
                    > file
                  </li>
                  <li>
                    <strong>macOS:</strong> Download the
                    <code
                      class="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground"
                      >.dmg</code
                    > file
                  </li>
                  <li>
                    <strong>Linux:</strong> Download the
                    <code
                      class="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground"
                      >.AppImage</code
                    >
                    or
                    <code
                      class="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground"
                      >.deb</code
                    > file
                  </li>
                </ul>
              </li>
              <li class="pt-2">
                Run the installer and follow the on-screen instructions.
              </li>
              <li>Launch the app from your applications menu.</li>
            </ol>

            <div
              class="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-600 dark:text-amber-400"
            >
              <strong>Security Note:</strong> The desktop apps are currently signed
              with self-signed certificates. You may see SmartScreen or Gatekeeper
              warnings on first launch—this is normal for independent open-source
              applications. The code is perfectly safe and can be fully audited on
              our public GitHub repository.
            </div>
          </div>
        </div>
      </section>

      <section id="available-tools" class="scroll-mt-32 space-y-6">
        <h2
          class="text-2xl font-bold text-foreground border-b border-border/50 pb-2"
        >
          Available Tools
        </h2>
        <p class="text-muted-foreground">
          A quick overview of the core utilities available in the toolkit.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each toolList.slice(0, 6) as tool}
            <a href={`/tools/${tool.slug}`}>
              <div
                class="p-4 border border-border rounded-xl bg-card hover:bg-muted/30 transition-colors"
              >
                <h4
                  class="font-semibold text-foreground flex items-center gap-2 mb-1"
                >
                  <tool.icon size={16} class="text-primary" />
                  {tool.title}
                </h4>
                <p class="text-xs text-muted-foreground">
                  {tool.description.split(". ")[0]}
                </p>
              </div>
            </a>
          {/each}
        </div>
      </section>

      <section id="privacy-security" class="scroll-mt-32 space-y-6">
        <h2
          class="text-2xl font-bold text-foreground border-b border-border/50 pb-2"
        >
          Privacy & Security
        </h2>
        <p class="text-muted-foreground">
          We operate with a strict privacy-first architecture that ensures your
          documents remain completely in your control:
        </p>

        <ul class="space-y-4 mt-4">
          <li class="flex items-start gap-3">
            <ArrowRight size={18} class="text-primary mt-1 shrink-0" />
            <div>
              <strong class="text-foreground">Local Processing:</strong>
              <span class="text-muted-foreground text-sm ml-1"
                >All PDF operations happen directly inside your browser using
                WebAssembly. Nothing is ever uploaded to a remote server.</span
              >
            </div>
          </li>
          <li class="flex items-start gap-3">
            <ArrowRight size={18} class="text-primary mt-1 shrink-0" />
            <div>
              <strong class="text-foreground">No Data Collection:</strong>
              <span class="text-muted-foreground text-sm ml-1"
                >We do not track, store, log, or analyze the contents of your
                documents in any way whatsoever.</span
              >
            </div>
          </li>
          <li class="flex items-start gap-3">
            <ArrowRight size={18} class="text-primary mt-1 shrink-0" />
            <div>
              <strong class="text-foreground">Offline Mode:</strong>
              <span class="text-muted-foreground text-sm ml-1"
                >Use the tools in airplane mode. Once the website loads, your
                data never leaves your physical device.</span
              >
            </div>
          </li>
          <li class="flex items-start gap-3">
            <ArrowRight size={18} class="text-primary mt-1 shrink-0" />
            <div>
              <strong class="text-foreground">Open Source:</strong>
              <span class="text-muted-foreground text-sm ml-1"
                >Our entire codebase is publicly available. Security researchers
                and developers can audit the source code to verify our privacy
                claims.</span
              >
            </div>
          </li>
        </ul>
      </section>

      <section id="faq" class="scroll-mt-32 space-y-6 pb-12">
        <h2
          class="text-2xl font-bold text-foreground border-b border-border/50 pb-2"
        >
          Frequently Asked Questions
        </h2>

        <div class="space-y-6">
          {#each faqs as faq, index}
            {#if index < 4}
              <div>
                <h4 class="font-bold text-foreground text-lg mb-1">
                  {faq.question}
                </h4>
                <p class="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            {:else}
              <div class="bg-muted/40 border border-border p-5 rounded-xl">
                <h4 class="font-bold text-foreground flex items-center gap-2 mb-2">
                  {faq.question}
                </h4>
                <p class="text-muted-foreground text-sm mb-4">
                  {faq.answer}
                </p>
                <Button
                  href={config.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} /> View GitHub Repository
                </Button>
              </div>
            {/if}
          {/each}
        </div>
      </section>
    </main>
  </div>

  <Footer />
</div>
