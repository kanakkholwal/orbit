import type { ToolContent } from './tool-content';

export const toolContentBatchA: Record<string, Partial<ToolContent>> = {
    'multi-pdf': {
        intro: 'Sometimes one job needs several PDF operations at once: pull pages from two files, put them in a new order, fix a sideways scan, drop a cover sheet and send the result as separate documents. PDF Multi-Tool puts every page from every file you add on one board. You can drag pages around, rotate, duplicate or delete them, insert blank pages, and mark where one document should end and the next begin. Undo and redo cover every change, and all of it runs on your own device.',
        howItWorks: [
            'Drop one or more PDFs, or use "Add files" later to bring in more. Each page appears as a thumbnail.',
            'Tap pages to select them, then rotate or delete them together, or drag any page to a new position.',
            'Use "Blank page" to insert an empty page, and the scissors on a page to start a new document after it.',
            'Press "Save PDF" for a single file, or "Save N PDFs" to get every section as its own PDF in a ZIP.'
        ],
        useCases: [
            { title: 'Assembling an application pack', body: 'Combine a CV, a scanned passport page and two reference letters from different files, in the order the form asks for, as one PDF.' },
            { title: 'Separating a batch scan', body: 'A scanner fed a stack of invoices into one long file. Place a split after the last page of each invoice and download them as individual PDFs.' },
            { title: 'Adding a page for notes or printing', body: 'Insert a blank page between chapters so double-sided printing starts each section on the right-hand side.' },
            { title: 'Cleaning up a shared file', body: 'Remove duplicate pages, turn sideways tables upright and move the appendix to the end before forwarding a document.' }
        ],
        faqs: [
            { q: 'How do I split a PDF into several files here?', a: 'Click the scissors on the last page of each section. The footer shows how many documents you will get, and saving produces a ZIP named split-documents.zip with files numbered document-1.pdf, document-2.pdf and so on.' },
            { q: 'Can I undo a page I deleted by mistake?', a: 'Yes. Undo and redo track every move, rotation, deletion, duplicate and split. Use the arrow buttons in the toolbar or Ctrl Z and Ctrl Shift Z (Cmd on a Mac).' },
            { q: 'What size is an inserted blank page?', a: 'Blank pages are A4 portrait, whatever the size of the pages around them.' },
            { q: 'What happens if a file is slightly damaged?', a: 'Each file goes through a repair step as it loads, which fixes many PDFs with broken internal structure. A file that is too badly damaged will show an error instead of pages.' }
        ]
    },
    'pdf-to-img': {
        intro: 'A PDF is awkward when you need a picture: you cannot drop it into a slide, attach it to a chat that only previews images, or post it on social media. PDF to Image saves every page of a PDF as a separate image file in JPG, PNG or WebP. Pages are drawn at twice their normal size, so text stays readable when you zoom in, and a quality slider lets you trade detail for smaller files. The conversion happens in your browser, and the images arrive together in one ZIP.',
        howItWorks: [
            'Drop a single PDF. Orbit shows its size and how many images you will get.',
            'Pick JPG, PNG or WebP under Format.',
            'For JPG or WebP, move the Quality slider. PNG always keeps full quality, so the slider is disabled.',
            'Press "Convert to JPG" (or PNG or WebP) and download the ZIP, with files named page_1, page_2 and so on.'
        ],
        useCases: [
            { title: 'Putting a chart into a presentation', body: 'Turn a report page into a PNG and place it on a slide, where a PDF could not be inserted directly.' },
            { title: 'Posting a flyer or menu online', body: 'Save an event poster or restaurant menu as a JPG that previews in messaging apps and on social media without opening a PDF reader.' },
            { title: 'Lighter images for a website', body: 'Export brochure pages as WebP to show them in a gallery on a web page with smaller downloads than JPG.' }
        ],
        faqs: [
            { q: 'What resolution are the images?', a: 'Each page is rendered at twice its PDF size, about 144 pixels per inch. An A4 page becomes an image of roughly 1190 by 1684 pixels.' },
            { q: 'Can I convert only some pages?', a: 'No. Every page of the file is converted. To get images of a few pages, first pull them into a new PDF with Extract PDF Pages or Organize PDF, then convert that file.' },
            { q: 'Which format should I choose?', a: 'PNG keeps text and line art perfectly sharp but produces the largest files. JPG is smaller and opens everywhere. WebP is smaller again at similar quality, but some older software cannot open it.' },
            { q: 'Why does my password-protected PDF not load?', a: 'The file has to be opened before its pages can be drawn, and this tool does not ask for a password. Remove the password with Decrypt PDF first, then convert the unlocked copy.' }
        ]
    },
    'encrypt-pdf': {
        intro: 'Emailing a payslip, a medical letter or a signed contract as a plain PDF means anyone who gets hold of the file can read it. Encrypt PDF adds a password that must be typed before the document opens, using 256-bit AES encryption. You can also set a second password that locks editing, copying and printing, so people can read the file but not change or print it. Because the encryption runs on your device, neither the document nor the password is ever sent anywhere.',
        howItWorks: [
            'Drop the PDF you want to protect.',
            'Type a password under "Choose a password", then enter it again in "Type it again".',
            'Optionally switch on "Lock editing and printing" and set a different second password.',
            'Press "Protect PDF". A copy named encrypted_ plus your file name downloads, and the original stays unchanged.'
        ],
        useCases: [
            { title: 'Sending payroll or HR documents', body: 'Protect salary slips or disciplinary letters before emailing them, and share the password with the recipient by phone or text.' },
            { title: 'Storing scans of identity documents', body: 'Keep passport, visa and tax ID scans in a cloud folder with a password on each file, so a leaked link alone does not expose them.' },
            { title: 'Distributing a read-only report', body: 'Share a board paper that recipients can open and read, while a second password stops them editing, copying text or printing it.' }
        ],
        faqs: [
            { q: 'What if I forget the password?', a: 'It cannot be recovered. Orbit does not keep a copy of the password or the file, so store it in a password manager before you send the protected PDF.' },
            { q: 'What does the second password actually block?', a: 'With the lock on, the file opens with the first password but viewers are asked not to allow editing, copying text, printing, adding comments, filling forms or rearranging pages. The second password lifts those limits. Most PDF readers respect these settings, but they are not enforced as strongly as the opening password.' },
            { q: 'Can I protect a PDF that already has a password?', a: 'Not directly. Remove the existing password with Decrypt PDF first, then protect the unlocked copy with the password you want.' }
        ]
    },
    'decrypt-pdf': {
        intro: 'A bank statement, utility bill or scanned archive that asks for a password every time becomes a chore to open, and many upload forms and document tools refuse locked PDFs outright. Decrypt PDF takes a file you already have the password for and saves a copy that opens without it. You type the password once, the encryption is removed on your device, and you download an unlocked version with the same pages and content. It does not guess or break unknown passwords.',
        howItWorks: [
            'Drop the password-protected PDF.',
            'Type its password in the Password field. The eye button shows what you typed.',
            'Press "Remove password", or hit Enter in the field.',
            'A copy named unlocked_ plus the file name downloads, ready to open with no prompt.'
        ],
        useCases: [
            { title: 'Monthly bank and card statements', body: 'Banks often lock statements with a date of birth or account digits. Unlock them once so they open straight away when you file your taxes or share them with an accountant.' },
            { title: 'Uploading to portals that reject locked files', body: 'Visa, loan and university application sites frequently fail on encrypted PDFs. Upload the unlocked copy instead.' },
            { title: 'Preparing a file for other tools', body: 'Merging, compressing, cropping or converting a locked PDF usually fails. Remove the password first, then continue with the unlocked copy.' }
        ],
        faqs: [
            { q: 'Can it open a PDF if I do not know the password?', a: 'No. You need the password that opens the file, or its permissions password. Orbit does not try to crack or bypass encryption.' },
            { q: 'Why does it say the password did not unlock the file?', a: 'Passwords are case sensitive, so check Caps Lock and any spaces. If you are sure the password is right, the file may be damaged, in which case Orbit reports that it could not unlock it.' },
            { q: 'Does unlocking change the content of my PDF?', a: 'No. Only the encryption is removed. Text, images, links, bookmarks and form fields are kept as they were.' }
        ]
    },
    'rotate-pdf': {
        intro: 'Scanners and phone cameras often save some pages sideways or upside down, which makes a PDF painful to read on screen and prints the wrong way round. Rotate PDF shows every page as a thumbnail so you can see exactly which ones need fixing. Turn individual pages a quarter turn left or right, or turn the whole document at once, then save a corrected copy. Pages are turned by changing their orientation setting rather than redrawing them, so text, links and image quality are left untouched.',
        howItWorks: [
            'Drop a PDF. Each page appears as a thumbnail, and turned pages get a highlighted border.',
            'Use the arrows under a page to turn it a quarter turn left or right.',
            'In the Rotation panel, "Turn left" or "Turn right" turns every page, and "Undo all turns" puts them back.',
            'Press "Turn N pages" to download a copy ending in _rotated.pdf.'
        ],
        useCases: [
            { title: 'Mixed portrait and landscape scans', body: 'A contract scanned with a landscape appendix shows those pages on their side. Turn just the appendix pages upright.' },
            { title: 'Pages fed in upside down', body: 'When a few sheets went through the document feeder the wrong way, give each one two quarter turns without affecting the rest.' },
            { title: 'Wide spreadsheets and drawings', body: 'Turn a landscape floor plan or wide table so it reads correctly on a tablet or prints across the long edge.' }
        ],
        faqs: [
            { q: 'Does rotating reduce the quality of my pages?', a: 'No. Orbit changes each page\'s rotation value, which tells PDF readers how to display it. The text and images inside are not re-rendered, so they stay searchable and sharp.' },
            { q: 'Can I rotate a page by 45 degrees?', a: 'No. PDF pages can only be turned in quarter turns: 90, 180 or 270 degrees.' },
            { q: 'Why is the save button disabled?', a: 'Saving is only enabled once at least one page ends up in a different orientation. Four quarter turns bring a page back to where it started, so it counts as unchanged.' }
        ]
    },
    'organize-pdf': {
        intro: 'Pages end up in the wrong order all the time: a report exported with the summary at the back, a scan fed in reverse, or a form where one page needs to appear twice. Organize PDF lets you rearrange the pages of a single PDF by dragging thumbnails, using the arrows under each page, or typing an order such as 3, 1, 2, 4-6. You can copy a page, leave pages out, and restore the original order at any point. The new file is built in your browser.',
        howItWorks: [
            'Drop one PDF to see all of its pages as thumbnails.',
            'Drag pages into place, or use the arrows under a page to move it earlier or later. Copy or delete pages with the buttons on each thumbnail.',
            'Or type an order in "Type an order" and press "Apply order". Repeat a number to copy a page, and leave one out to drop it.',
            'Press "Save new PDF" to download a file ending in _organized.pdf.'
        ],
        useCases: [
            { title: 'Fixing a scan that came out backwards', body: 'A stack scanned face up ends with page 1 last. Type a range from the last page to 1, such as 12-1, to reverse the whole document in one step.' },
            { title: 'Moving a summary to the front', body: 'Put an executive summary or cover letter from the end of a report before the main content.' },
            { title: 'Repeating a page in a pack', body: 'Include the same terms page or sign-in sheet after each section of a training handout without editing the original.' }
        ],
        faqs: [
            { q: 'What can I type in the page order box?', a: 'Page numbers and ranges separated by commas, like 5, 1-3, 3, 8-6. A range written high to low is added in reverse. Any number larger than the page count is flagged before you apply it.' },
            { q: 'Can I rearrange pages from more than one PDF?', a: 'Not in this tool, which works on one file at a time. To combine and reorder pages from several files, use PDF Multi-Tool.' },
            { q: 'Why can I not delete the last page?', a: 'A PDF needs at least one page, so the final remaining page cannot be removed.' },
            { q: 'Does it rotate pages too?', a: 'No. Organize PDF only changes order and which pages are included. Use Rotate PDF to turn pages.' }
        ]
    },
    'extract-pages': {
        intro: 'Often you only need a few pages of a long PDF: the signed page of a contract, one chapter of a textbook, or the receipts buried in a monthly export. Extract PDF Pages lets you pick those pages by tapping numbers in a grid or typing ranges like 1, 3-5, 8, and saves each chosen page as its own PDF. The files are bundled into one ZIP and named after the original with their page number. The source file stays as it is, and nothing is uploaded.',
        howItWorks: [
            'Drop a PDF. A numbered tile appears for every page.',
            'Tap tiles to select pages, or type them under "Pages to keep". "Select all" and "Clear" work on the whole grid.',
            'Check the footer, which lists your selection as compact ranges.',
            'Press "Extract N pages" and download the ZIP with one PDF per page.'
        ],
        useCases: [
            { title: 'Sending only the signature page', body: 'Return page 14 of a signed agreement to a counterparty without sending the full contract again.' },
            { title: 'Filing receipts one by one', body: 'Break a combined expenses export into single-page PDFs so each receipt can be attached to its own claim line.' },
            { title: 'Sharing individual worksheets', body: 'Teachers can pull specific exercises from a workbook and hand each one out as a separate file.' }
        ],
        faqs: [
            { q: 'Can I get the selected pages in a single PDF instead?', a: 'This tool always saves one PDF per page. To keep several pages together in one file, use Organize PDF and leave out the pages you do not want, or use PDF Multi-Tool.' },
            { q: 'What happens if I type a page number that does not exist?', a: 'Numbers outside the document are ignored. If none of what you typed matches a real page, the footer tells you how many pages the file has and extraction stays disabled.' },
            { q: 'Are the pages extracted in the order I type them?', a: 'No. Pages are saved in their original order, and repeated numbers are only extracted once.' }
        ]
    },
    'crop-pdf': {
        intro: 'Wide white margins make PDFs tiny on a phone or e-reader, and scanned pages often carry a dark border or a punched-hole strip along one edge. Crop PDF lets you draw a box on a page, or set how much to trim from the top, bottom, left and right as a percentage, and keeps only what is inside. Apply one crop to every page or a different one per page. By default the hidden area is just covered, and an optional setting removes it from the file entirely.',
        howItWorks: [
            'Drop a PDF and move between pages with the arrows beside "Page 1 of N".',
            'Drag the edges of the box on the page, or type Top, Bottom, Left and Right margins in the Crop panel.',
            'Turn on "Same crop on every page" to reuse this page\'s crop, and "Remove hidden content" if the trimmed parts must be deleted.',
            'Press "Crop N pages" to download the cropped copy.'
        ],
        useCases: [
            { title: 'Reading papers on a small screen', body: 'Trim the wide margins of an academic paper or ebook so the text fills a phone or e-reader display.' },
            { title: 'Removing scanner borders', body: 'Cut away the grey edge and hole-punch marks that a flatbed scanner leaves around each page.' },
            { title: 'Isolating one figure or label', body: 'Crop a page down to a single chart, map or shipping label so it can be printed or shared on its own.' }
        ],
        faqs: [
            { q: 'Is the cropped area really deleted?', a: 'Not by default. A normal crop tells PDF readers which part of the page to show, and the rest stays in the file and can be revealed again with an editor. Switch on "Remove hidden content" when the trimmed area contains something private.' },
            { q: 'Why can I not select text after cropping?', a: '"Remove hidden content" turns each cropped page into an image so the trimmed parts are gone for good. That also means text on those pages can no longer be selected or searched. Pages you did not crop are copied unchanged.' },
            { q: 'Can I crop pages differently from each other?', a: 'Yes. With "Same crop on every page" off, each page keeps its own crop box. Pages you never adjust are left at full size, and "Keep the whole page" clears the crop on the current page.' }
        ]
    },
    'edit-pdf': {
        intro: 'Marking up a PDF usually means buying desktop software or uploading a document to an online editor. Edit PDF opens your file in a full workspace where you can highlight, underline and strike through text, type text boxes, draw freehand, add rectangles, circles, arrows and lines, place stamps, leave comments and insert links. A Redact mode blacks out text or areas and removes what is underneath. Every change can be undone, and the edited file is exported from your browser without being uploaded.',
        howItWorks: [
            'Drop one or more PDFs. Each file opens in its own tab.',
            'Choose a mode at the top: Annotate for highlights, text and ink, Shapes for boxes, lines and arrows, or Redact to black out content.',
            'Click a tool and then click or drag on the page. Select an annotation to change it or delete it, and use Undo and Redo as you go.',
            'Open the document menu and choose Export to download the edited PDF, or Print to print it directly.'
        ],
        useCases: [
            { title: 'Reviewing a draft contract', body: 'Highlight clauses, strike out wording you disagree with and leave comments for the other party before sending the file back.' },
            { title: 'Redacting before sharing', body: 'Black out account numbers, addresses or names in a statement or court bundle, then apply the redactions so the text underneath is removed.' },
            { title: 'Marking up drawings and plans', body: 'Circle problem areas on a site plan, add arrows and short notes, and send the marked-up copy to a contractor.' },
            { title: 'Grading and feedback', body: 'Write freehand corrections and typed comments on a student\'s submitted essay.' }
        ],
        faqs: [
            { q: 'Can I change the existing text in my PDF?', a: 'Not like a word processor. Edit PDF adds annotations on top of the page: text boxes, highlights, insert and replace marks, shapes and drawings. To cover old wording, redact it and place a text box over the gap.' },
            { q: 'Is redaction permanent?', a: 'Redactions are first shown as marked areas you can still adjust. Once you apply them, the content under each area is removed from the page in the exported file, not just hidden behind a black box.' },
            { q: 'Can I edit a password-protected PDF?', a: 'Yes, if you know the password. The editor asks for it when the file opens, and the password is only used on your device.' }
        ]
    },
    'create-pdf': {
        intro: 'Making a tidy invoice, resume or certificate normally means fighting a word processor\'s layout or signing up for a design website. Create PDF is a page designer in your browser: start from one of 16 templates such as an invoice, quote, receipt, resume, project proposal or event ticket, type directly on the page, and add blocks like tables, totals, charts, QR codes, barcodes and signature lines. Choose a theme, accent colour and paper size, then download a real PDF with selectable text. Drafts save automatically on your device.',
        howItWorks: [
            'Pick a template under "Start from a template", or choose "Blank page". Recent work appears under "Continue editing".',
            'Click text on the page to type over it, and add blocks such as Table, Totals, Timeline or QR code from the block library.',
            'In Document settings, choose a theme, accent colour, paper size, margins, and an optional header, footer with page numbers, or watermark.',
            'Open Preview to see the real page breaks, then press "Download PDF".'
        ],
        useCases: [
            { title: 'Freelance invoices', body: 'Use the Invoice template with your letterhead, line items and bank details, and replace fields like {{client}} and {{number}} for each new job.' },
            { title: 'A one-page resume', body: 'Start from the Resume template with a timeline for experience and tags for skills, then switch themes until it suits the role.' },
            { title: 'Course certificates', body: 'Produce certificates with signature lines for a workshop or training course, changing only the recipient name for each copy.' },
            { title: 'Quotes for customers', body: 'Send a builder\'s or agency quote with scope, a cost table, a validity date and space for both parties to sign.' }
        ],
        faqs: [
            { q: 'What are fields like {{client}}?', a: 'Type any name in double braces anywhere in the document and it becomes a field. Fill in its value once in the Fields panel and every place it appears updates, which makes a layout easy to reuse.' },
            { q: 'Where are my drafts saved?', a: 'Drafts are saved automatically in this browser\'s storage on your device. To move one to another computer or keep a backup, use "Save draft as file" and later "Open a draft file" to load the .orbit.json file.' },
            { q: 'Why does the editor look different from the downloaded PDF?', a: 'The editor shows your document as one long page for easy editing. Preview builds the actual PDF, so you can see where content breaks onto new pages before downloading.' },
            { q: 'What paper sizes are available?', a: 'A4, US Letter, US Legal and A5, each in portrait or landscape, with narrow, normal or wide margins.' }
        ]
    },
    'view-pdf': {
        intro: 'Browser PDF previews are basic, and installing a separate reader just to open one file is overkill. View PDF opens documents in a desktop-style reader with page thumbnails, the document outline, full-text search with "Match case" and "Whole words" options, and zoom from fit-to-page up to 1600 percent. Read one page at a time or as two-page spreads, scroll vertically or horizontally, rotate the view, and keep several PDFs open in tabs. Files load from your device, and locked documents ask for their password locally.',
        howItWorks: [
            'Drop one or more PDFs. Each opens in its own tab, and you can add more at any time.',
            'Open the sidebar to jump between thumbnails or chapters in the outline.',
            'Use Search to find words, the zoom menu for fit to width or a set percentage, and Page Settings for spreads, scroll direction and rotation.',
            'Print or export the file from the document menu when you are done.'
        ],
        useCases: [
            { title: 'Reading long manuals and reports', body: 'Jump straight to a section using the outline, and search for a part number or term instead of scrolling through hundreds of pages.' },
            { title: 'Checking a print layout', body: 'Switch to two-page spreads to see how facing pages of a magazine, booklet or book proof line up.' },
            { title: 'Comparing documents side by side in tabs', body: 'Open an old and a new version of a contract in separate tabs and flick between them while reviewing.' }
        ],
        faqs: [
            { q: 'Can I open a password-protected PDF?', a: 'Yes. The viewer shows a prompt asking for the password, and the file opens once it is correct. The password is only used in this session on your device.' },
            { q: 'Why can I not search the text in my PDF?', a: 'Search only finds real text. A scanned document is made of page images, so it has no text to search until it is run through OCR.' },
            { q: 'What is the difference between Two Page (Odd) and Two Page (Even)?', a: 'Both show pages in pairs. Odd starts pairing from page 1, while Even keeps page 1 on its own, like the cover of a printed book, so the following pages face each other correctly.' },
            { q: 'Can I zoom into a specific area?', a: 'Yes. Marquee Zoom lets you drag a box around the part of the page you want to enlarge, alongside zoom in, zoom out, fit to page and fit to width.' }
        ]
    }
};
