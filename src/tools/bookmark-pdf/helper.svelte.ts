import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, PDFHexString, PDFName, PDFNumber, PDFRef } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export type BookmarkColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | null | string;
export type BookmarkStyle = 'bold' | 'italic' | 'bold-italic' | null;

export interface BookmarkNode {
    id: string;
    title: string;
    page: number; // 1-based
    children: BookmarkNode[];
    color: BookmarkColor;
    style: BookmarkStyle;
    destX: number | null;
    destY: number | null;
    zoom: number | null;
    isExpanded?: boolean;
}

export interface BookmarkStateData {
    file: File | null;
    pageCount: number;
    currentPage: number;
    bookmarks: BookmarkNode[];
    selectedIds: Set<string>;
    isProcessing: boolean;
    isPicking: boolean; // For "Pick Destination" mode
    history: string[]; // JSON stringified states for simple undo/redo
    historyIndex: number;
}

const COLORS: Record<string, number[]> = {
    red: [1, 0, 0],
    green: [0, 1, 0],
    blue: [0, 0, 1],
    yellow: [1, 1, 0],
    purple: [0.5, 0, 0.5]
};

export class BookmarkPdfState extends PdfEngine {
    state = $state<BookmarkStateData>({
        file: null,
        pageCount: 0,
        currentPage: 1,
        bookmarks: [],
        selectedIds: new Set(),
        isProcessing: false,
        isPicking: false,
        history: [],
        historyIndex: -1
    });

    pdfLibDoc: PDFDocument | null = null;
    pdfJsDoc: PDFDocumentProxy | null = null;

    // --- History Management ---
    snapshot() {
        // Remove future history if we diverge
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        }
        this.state.history.push(JSON.stringify(this.state.bookmarks));
        this.state.historyIndex++;
    }

    undo() {
        if (this.state.historyIndex > 0) {
            this.state.historyIndex--;
            this.state.bookmarks = JSON.parse(this.state.history[this.state.historyIndex]);
        }
    }

    redo() {
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.historyIndex++;
            this.state.bookmarks = JSON.parse(this.state.history[this.state.historyIndex]);
        }
    }

    // --- Loading ---
    async loadFile(file: File) {
        if (!file) return;
        this.state.isProcessing = true;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // Load PDF.js for rendering
            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;

            // Load PDF-Lib for saving/editing
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            this.state.file = file;
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.currentPage = 1;
            this.state.bookmarks = [];
            this.state.history = [];
            this.state.historyIndex = -1;
            
            // Initial snapshot
            this.snapshot();

        } catch (e) {
            console.error(e);
            alert("Failed to load PDF.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    // --- Rendering ---
    async renderCurrentPage(canvas: HTMLCanvasElement) {
        if (!this.pdfJsDoc) return;
        // Use base engine
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, this.state.currentPage - 1); // 0-based
    }

    // --- Bookmark Operations ---
    
    addBookmark(parent: BookmarkNode | null, title: string) {
        const newNode: BookmarkNode = {
            id: crypto.randomUUID(),
            title,
            page: this.state.currentPage,
            children: [],
            color: null,
            style: null,
            destX: null,
            destY: null,
            zoom: null,
            isExpanded: true
        };

        if (parent) {
            parent.children.push(newNode);
            parent.isExpanded = true;
        } else {
            this.state.bookmarks.push(newNode);
        }
        this.snapshot();
    }

    updateBookmark(id: string, updates: Partial<BookmarkNode>) {
        const findAndUpdate = (nodes: BookmarkNode[]) => {
            for (const node of nodes) {
                if (node.id === id) {
                    Object.assign(node, updates);
                    return true;
                }
                if (findAndUpdate(node.children)) return true;
            }
            return false;
        };
        findAndUpdate(this.state.bookmarks);
        this.snapshot();
    }

    deleteBookmark(id: string) {
        const filterNodes = (nodes: BookmarkNode[]): BookmarkNode[] => {
            return nodes.filter(node => {
                if (node.id === id) return false;
                node.children = filterNodes(node.children);
                return true;
            });
        };
        this.state.bookmarks = filterNodes(this.state.bookmarks);
        this.state.selectedIds.delete(id);
        this.snapshot();
    }

    // --- Extraction (From existing PDF) ---
    async extractExisting() {
        if(!this.pdfJsDoc) return;
        const outline = await this.pdfJsDoc.getOutline();
        if(!outline) {
            alert("No bookmarks found in this PDF.");
            return;
        }

        const processItem = async (item: any): Promise<BookmarkNode> => {
            let pageIndex = 0;
            // Simplified ref resolution logic (production logic needs to handle Promises/Refs robustly)
            // For now, assuming basic structure or 0 default
            if(Array.isArray(item.dest) && this.pdfJsDoc) {
                 try {
                    const ref = item.dest[0];
                    pageIndex = await this.pdfJsDoc.getPageIndex(ref);
                 } catch(e) {}
            }

            const node: BookmarkNode = {
                id: crypto.randomUUID(),
                title: item.title,
                page: pageIndex + 1,
                children: [],
                color: null, // Parsing color from raw outline is complex, skipping for simplicity
                style: null,
                destX: null,
                destY: null,
                zoom: null,
                isExpanded: false
            };

            if(item.items && item.items.length > 0) {
                for(const child of item.items) {
                    node.children.push(await processItem(child));
                }
            }
            return node;
        }

        const newTree = [];
        for(const item of outline) {
            newTree.push(await processItem(item));
        }
        
        if(confirm(`Found ${newTree.length} root bookmarks. Replace current?`)) {
            this.state.bookmarks = newTree;
            this.snapshot();
        }
    }

    // --- Saving ---
    async save() {
        if (!this.pdfLibDoc || !this.state.file) return;
        this.state.isProcessing = true;

        try {
            // Logic to flush outlines to PDF-Lib
            // Note: PDF-Lib outline support is low-level. We construct the dictionary manually.
            
            const context = this.pdfLibDoc.context;
            const pages = this.pdfLibDoc.getPages();
            const outlinesDict = context.obj({});
            const outlinesRef = context.register(outlinesDict);

            const createItems = (nodes: BookmarkNode[], parentRef: PDFRef): any[] => {
                const items: any[] = [];
                
                for(let i=0; i<nodes.length; i++) {
                    const node = nodes[i];
                    const itemDict = context.obj({});
                    const itemRef = context.register(itemDict);

                    // Title
                    itemDict.set(PDFName.of('Title'), PDFHexString.fromText(node.title));
                    itemDict.set(PDFName.of('Parent'), parentRef);

                    // Destination
                    const pageIndex = Math.max(0, Math.min(node.page - 1, pages.length - 1));
                    const pageRef = pages[pageIndex].ref;
                    
                    // Basic XYZ destination
                    const destArr = [pageRef, PDFName.of('XYZ'), 
                        node.destX ? PDFNumber.of(node.destX) : null,
                        node.destY ? PDFNumber.of(node.destY) : null,
                        node.zoom ? PDFNumber.of(node.zoom / 100) : null
                    ];
                    itemDict.set(PDFName.of('Dest'), context.obj(destArr));

                    // Style/Color
                    if (node.style) {
                       let flags = 0;
                       if(node.style.includes('italic')) flags += 1;
                       if(node.style.includes('bold')) flags += 2;
                       itemDict.set(PDFName.of('F'), PDFNumber.of(flags));
                    }
                    if (node.color && COLORS[node.color]) {
                       itemDict.set(PDFName.of('C'), context.obj(COLORS[node.color]));
                    }

                    // Children
                    if(node.children.length > 0) {
                        const children = createItems(node.children, itemRef);
                        if(children.length > 0) {
                            itemDict.set(PDFName.of('First'), children[0].ref);
                            itemDict.set(PDFName.of('Last'), children[children.length-1].ref);
                            itemDict.set(PDFName.of('Count'), context.obj(children.length)); // Open by default?
                        }
                    }

                    // Prev/Next
                    if(i > 0) {
                        itemDict.set(PDFName.of('Prev'), items[i-1].ref);
                        items[i-1].dict.set(PDFName.of('Next'), itemRef);
                    }

                    items.push({ ref: itemRef, dict: itemDict });
                }
                return items;
            };

            const roots = createItems(this.state.bookmarks, outlinesRef);
            
            if(roots.length > 0) {
                outlinesDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
                outlinesDict.set(PDFName.of('First'), roots[0].ref);
                outlinesDict.set(PDFName.of('Last'), roots[roots.length - 1].ref);
                outlinesDict.set(PDFName.of('Count'), context.obj(roots.length));
                
                this.pdfLibDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);
            }

            const pdfBytes = await this.pdfLibDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = this.state.file.name.replace('.pdf', '_bookmarked.pdf');
            a.click();

        } catch(e) {
            console.error(e);
            alert("Error saving PDF.");
        } finally {
            this.state.isProcessing = false;
        }
    }
}