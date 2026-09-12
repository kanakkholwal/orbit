import type { ToolContent } from './tool-content';

/** Hand-written page content for the tools added in September 2026. */
export const moreToolContent: Record<string, Partial<ToolContent>> = {
    'excel-to-pdf': {
        intro: 'Printing a spreadsheet straight from Excel often gives you columns cut off at the edge, a header that only appears on the first page, and tiny unreadable text. Excel to PDF turns each sheet into a clean table that flows across as many pages as it needs, repeats the header row at the top of every page, and turns the page sideways when a sheet is too wide. It reads Excel, CSV and OpenDocument files, and everything happens in your browser.',
        howItWorks: [
            'Drop one or more Excel, CSV or ODS files.',
            'Tick the sheets you want and check the preview of the first rows.',
            'Choose paper size, orientation, text size, and whether the first row is a header.',
            'Download one PDF per file, or a ZIP when you convert several. Nothing is uploaded.'
        ],
        useCases: [
            { title: 'Sharing reports with people without Excel', body: 'Send a sales report, budget or price list as a PDF that opens the same on every phone and computer.' },
            { title: 'Printing long lists', body: 'Attendance sheets, inventories and contact lists print across many pages with the column names on every one.' },
            { title: 'Exports from other apps', body: 'Many apps export data as CSV. Turn those files into a readable table without opening a spreadsheet program.' },
            { title: 'Wide sheets', body: 'Sheets with many columns switch to landscape automatically, and small text fits even more on each page.' }
        ],
        faqs: [
            { q: 'Does the header row repeat on every page?', a: 'Yes. When "First row is a header" is on, that row appears at the top of every page. When it is off, columns are labelled A, B, C instead.' },
            { q: 'Will my formatting, colours and formulas be kept?', a: 'No. The PDF shows the values you see in each cell as a clean, consistent table. Cell colours, merged cells and charts are not copied, and formulas appear as their results.' },
            { q: 'What if my sheet has too many columns to fit?', a: 'Auto orientation turns the page sideways when a sheet is wide. For very wide sheets, choose landscape and small text. Long text wraps inside its cell.' }
        ]
    },
    'scan-to-pdf': {
        intro: 'You do not need a scanner or a scanning app to send a signed form, a receipt or a page of notes as a PDF. Scan to PDF uses your phone camera or your computer\'s webcam to photograph each page, lets you put them in order and turn any that are sideways, and saves them as one PDF. An optional enhance setting makes pages black and white with brighter paper and darker text. Photos are processed on your device and never uploaded.',
        howItWorks: [
            'Take a photo of each page with your camera, or add photos you already have.',
            'Drag pages into order, rotate any that are sideways, and delete retakes.',
            'Turn on "Enhance for documents" if you want crisp black and white pages, and pick a paper size.',
            'Create the PDF and download it. Your photos stay on your device.'
        ],
        useCases: [
            { title: 'Signed forms and contracts', body: 'Sign on paper, photograph each page and send back a single PDF in a minute.' },
            { title: 'Receipts and expenses', body: 'Collect a week of receipts into one tidy PDF for an expense claim or your records.' },
            { title: 'Class notes and handouts', body: 'Turn handwritten notes or printed handouts into a PDF you can keep and share.' }
        ],
        faqs: [
            { q: 'Does it straighten or crop my photos automatically?', a: 'No. Pages are not detected, straightened or cropped. For the best result, lay the page flat in good light and fill the frame with it.' },
            { q: 'Why can I not use my webcam?', a: 'Your browser needs permission to use the camera. If access was blocked, allow it in the site settings, or take photos with another app and add them instead.' },
            { q: 'Is the text in the PDF searchable?', a: 'No, each page is an image. Run the PDF through OCR PDF afterwards to make the text selectable and searchable.' }
        ]
    },
    'compare-pdf': {
        intro: 'When a contract, report or paper comes back as a new PDF, it is hard to spot what actually changed. Compare PDFs reads the text of both versions and marks every word that was added in green and every word that was removed in red with a line through it, page by page. It tells you how many changes there are and on which pages, and lets you jump from one change to the next. Both files are read in your browser and never uploaded.',
        howItWorks: [
            'Drop the original PDF and the changed version. You can swap them if needed.',
            'Orbit reads the text on every page of both files and lines up the pages, even when pages were added or removed.',
            'It marks added words in green and removed words in red, and counts the changes on each page.',
            'Step through the changes with Next and Previous, or hide the pages that did not change.'
        ],
        useCases: [
            { title: 'Checking a contract before you sign', body: 'See exactly which words the other side changed in the new draft, instead of reading both versions line by line.' },
            { title: 'Reviewing edits to a report', body: 'Find what a colleague added or cut between two exports of the same document.' },
            { title: 'Spotting changes in terms and policies', body: 'Compare an old and a new version of terms, a policy or a price list to find the sentences that are different.' }
        ],
        faqs: [
            { q: 'Does it compare images, layout or colours?', a: 'No. Compare PDFs looks at the words in each file. Changes to pictures, fonts, colours or position are not marked.' },
            { q: 'Why does it say there is no text to compare?', a: 'Scanned documents are pictures of pages, so there are no words to read. Run OCR PDF on both files first, then compare the results.' },
            { q: 'Are my files uploaded?', a: 'No. Both PDFs are read on your device, in your browser. Nothing is sent to a server.' }
        ]
    },
    'read-pdf-aloud': {
        intro: 'Sometimes it is easier to listen than to read. Read PDF Aloud turns the text of any PDF into speech using a voice that is already on your device, and highlights each sentence as it is read so you can follow along. Choose a voice and a speed, start from any page or click a sentence to jump there, and pause whenever you like. The voice plays live, so it cannot be saved as an audio file.',
        howItWorks: [
            'Drop a PDF into Read PDF Aloud.',
            'Orbit pulls the text out of every page and splits it into paragraphs and sentences.',
            'Pick a voice and a speed, then press Read aloud, choose a page to start from, or click any sentence.',
            'Follow the highlighted sentence as it is read, and pause, stop or skip whenever you want.'
        ],
        useCases: [
            { title: 'Studying on the go', body: 'Listen to lecture notes, articles or chapters while you walk, cook or rest your eyes.' },
            { title: 'Easier reading', body: 'Hearing the text while each sentence is highlighted can help with dyslexia, low vision or tired eyes.' },
            { title: 'Proofreading your own writing', body: 'Hearing a report or essay read back makes missing words and clumsy sentences easier to catch.' }
        ],
        faqs: [
            { q: 'Where do the voices come from?', a: 'They come from your device and browser, so the list differs between computers and phones. Voices marked Online are provided by your browser maker and may send the text to their servers. Pick a voice without that label to keep everything on your device.' },
            { q: 'Can I download the audio as an MP3?', a: 'No. The browser speaks the text live and does not give websites a way to record it, so there is no audio file to save.' },
            { q: 'Why does it say there is no text to read?', a: 'Scanned PDFs are pictures of pages and have no words in them. Run OCR PDF first, then open the result here.' }
        ]
    },
    'pages-per-sheet': {
        intro: 'Printing slides, handouts or long documents one page per sheet uses a lot of paper. Pages per Sheet places 2, 4, 6, 8 or 9 pages side by side on each sheet, scaled down to fit and kept in their original shape. Choose A4, Letter or the size of your original, pick the orientation, and adjust the margins, the gaps and the order the pages follow. A live preview shows the layout before you save.',
        howItWorks: [
            'Drop a PDF into Pages per Sheet.',
            'Choose how many pages go on each sheet, the sheet size and the orientation.',
            'Adjust the margin, the gap between pages, the page order and an optional thin border while the preview updates.',
            'Download the new PDF, ready to print. Nothing is uploaded.'
        ],
        useCases: [
            { title: 'Slide handouts', body: 'Print a presentation with 4 or 6 slides on each page so it is easy to flip through and take notes on.' },
            { title: 'Saving paper and ink', body: 'Fit two pages on every sheet to halve the paper a long document needs.' },
            { title: 'Study sheets', body: 'Put 8 or 9 pages of notes on one sheet for a compact revision summary.' }
        ],
        faqs: [
            { q: 'Will my pages be stretched?', a: 'No. Each page is scaled down evenly to fit its space and centred, so it keeps its original shape.' },
            { q: 'What does Auto orientation do?', a: 'It tries the sheet both upright and sideways and picks whichever makes your pages the largest.' },
            { q: 'Can I use a password-protected PDF?', a: 'Not directly. Unlock it first with Decrypt PDF, then open the unlocked file here.' }
        ]
    },
    'flatten-pdf': {
        intro: 'A filled-in PDF form can still be changed by anyone who opens it: answers can be retyped, boxes unticked and comments moved or deleted. Flatten PDF draws every form field and comment onto the page exactly as it looks right now, then removes the editable version. The result reads and prints the same, but the answers and markup are part of the page. Nothing is turned into an image, so text stays sharp.',
        howItWorks: [
            'Drop one or more PDFs into Flatten PDF.',
            'Choose whether to flatten form fields, comments and markup, or both.',
            'Orbit draws each item onto its page as it currently looks and removes the editable copy. Links stay clickable.',
            'Download the flattened files. Your originals stay untouched, and nothing is uploaded.'
        ],
        useCases: [
            { title: 'Sending a completed form', body: 'Flatten an application, tax or HR form after filling it in, so the answers cannot be changed after you send it.' },
            { title: 'Sharing reviewed documents', body: 'Keep highlights, stamps and drawings visible exactly where the reviewer placed them, without letting anyone move or delete them.' },
            { title: 'Printing and archiving', body: 'Some printers and older viewers skip form fields and comments. Flattened files show them everywhere.' }
        ],
        faqs: [
            { q: 'Does flattening turn my pages into images?', a: 'No. Orbit draws the saved look of each field and comment into the page itself, so text stays sharp.' },
            { q: 'Why was something left editable?', a: 'Some fields and comments are saved without a picture of how they look, so there is nothing to draw. They stay as they were unless you choose to delete them.' },
            { q: 'What happens to sticky notes?', a: 'A sticky note becomes its small icon on the page. The text inside the note is not kept, so copy it out first if you need it.' }
        ]
    },
    'repair-pdf': {
        intro: 'A PDF can stop opening after an interrupted download, a failed email attachment or a crash while saving. Often most of the document is still there, but the index that tells a viewer where everything lives is broken. Repair PDF reads the file piece by piece, rebuilds that structure from whatever can still be read, and saves a fresh copy. It tells you honestly which files were fine, which were repaired and which could not be recovered.',
        howItWorks: [
            'Drop the PDFs that will not open, or that show errors, into Repair PDF.',
            'Orbit checks each file. Files that open cleanly are marked as not damaged.',
            'Damaged files are rebuilt object by object from the parts that can still be read.',
            'Repaired files download automatically. Check the pages before relying on them.'
        ],
        useCases: [
            { title: 'Interrupted downloads', body: 'A PDF that stopped downloading part way often still holds most of its pages. Repair recovers what arrived.' },
            { title: 'Email attachments that will not open', body: 'Attachments sometimes get damaged in transit. Rebuild the file instead of asking for it again.' },
            { title: 'Errors in other tools', body: 'If merging, compressing or signing fails with a read error, repair the file first and try again.' }
        ],
        faqs: [
            { q: 'Will Repair PDF recover every page?', a: 'Only what is still inside the file. If part of it was cut off or overwritten, that part is gone, so a page may come back blank.' },
            { q: 'Can it repair a password-protected PDF?', a: 'No. Locked files are marked as locked. Remove the password with Decrypt PDF first, then repair the unlocked copy.' },
            { q: 'Is my file uploaded to be repaired?', a: 'No. The repair runs entirely in your browser, so the file never leaves your device.' }
        ]
    },
    'pdf-privacy-check': {
        intro: 'A PDF often carries more than its pages. Your name, the app and computer it was made on, when it was edited, reviewer comments, attached files and even scripts can travel with it to everyone you send it to. PDF Privacy Check lists what is hidden in the file, rates how sensitive each item is, and removes document details, hidden metadata, attachments, scripts and earlier saved versions in one step. It is clear about what it keeps.',
        howItWorks: [
            'Drop the PDF you are about to share into PDF Privacy Check.',
            'Orbit lists what it finds, most serious first: attached files, scripts, names, dates, comments, form answers and links.',
            'Choose whether to remove comments too. Form fields and links are kept so the document still works.',
            'Click Clean and download. Orbit checks the cleaned copy again and shows anything still inside.'
        ],
        useCases: [
            { title: 'Sending a CV or cover letter', body: 'Remove the author name, editing history and app details left by your word processor before applying.' },
            { title: 'Sharing contracts and reports', body: 'Make sure reviewer comments, earlier drafts and attached working files do not go out with the final version.' },
            { title: 'Publishing documents online', body: 'Strip metadata and scripts from PDFs before putting them on a website where anyone can download them.' }
        ],
        faqs: [
            { q: 'What does Clean and download remove?', a: 'Document details like author and dates, hidden XMP metadata, attached files, scripts and automatic actions, and earlier saved versions. Comments are removed only if you turn that on.' },
            { q: 'Does it check the text on my pages?', a: 'No. It looks for information hidden inside the file, not what is written on the pages, so read the visible content yourself before sharing.' },
            { q: 'Why are form fields and links kept?', a: 'Removing them would break the document. They are listed so you can check them; use Flatten PDF to lock form answers in place.' }
        ]
    },
    'pdf-color-filters': {
        intro: 'PDF Color Filters changes how every page of a PDF looks. Turn a colourful document grayscale before printing, make a crisp black and white copy, flip the colours for reading at night, give it a warm sepia tone, or make it look like a scanned paper copy. You can also set brightness, contrast and colour yourself, with a live before and after preview. Each page is saved as a picture, so the text is no longer selectable; run OCR PDF afterwards if you need it searchable.',
        howItWorks: [
            'Drop a PDF into PDF Color Filters.',
            'Pick a filter and watch the before and after preview.',
            'Choose the sharpness and image quality to balance clarity against file size.',
            'Apply the filter and download the new PDF. Nothing is uploaded.'
        ],
        useCases: [
            { title: 'Printing without colour ink', body: 'Make slides, reports or charts grayscale so they print cleanly on a black and white printer.' },
            { title: 'Reading at night', body: 'Invert a bright white document into light text on a dark page that is easier on the eyes in a dark room.' },
            { title: 'Cleaning up faded scans', body: 'Raise contrast or switch to black and white to make faint, greyish scans easier to read and print.' }
        ],
        faqs: [
            { q: 'Why can I no longer select the text?', a: 'To apply the filter, each page is redrawn as a picture. Run OCR PDF on the result to make the text searchable and selectable again.' },
            { q: 'Why is my file bigger than before?', a: 'Pages that were mostly text are now pictures, which take more space. Lower the sharpness or the image quality for a smaller file.' },
            { q: 'Does Invert work on photos?', a: 'It flips every colour, so photos look like film negatives. It works best on documents that are mostly text on a white page.' }
        ]
    },
    'rasterize-pdf': {
        intro: 'Rasterize PDF turns every page of a PDF into a flat image and puts those images back together as a new PDF at the same page sizes. Everything you can see is locked into the picture: filled-in forms, comments, stamps and signatures. Hidden text, extra layers and leftover page data are left behind. Use it to discourage copying, to lock a filled form, or to fix a PDF that prints with missing or garbled parts.',
        howItWorks: [
            'Drop a PDF into Rasterize PDF.',
            'Choose the sharpness: 150, 200 or 300 DPI. Higher is crisper but makes a bigger file.',
            'Pick JPG for smaller files or PNG for the sharpest text, and turn on grayscale if you do not need colour.',
            'Rasterize and download. Each page is drawn on your device and nothing is uploaded.'
        ],
        useCases: [
            { title: 'Discourage text copying', body: 'Share a document people can read and print, but cannot easily copy text from or edit.' },
            { title: 'Fix printing problems', body: 'PDFs with unusual fonts, transparency or layers sometimes print with missing parts. An image version usually prints exactly as it looks on screen.' },
            { title: 'Remove hidden content', body: 'Hidden text layers, invisible notes and old content under the page are not carried into the images.' }
        ],
        faqs: [
            { q: 'Can the text still be copied?', a: 'Not as text. Someone could still run text recognition on the images, so rasterizing discourages copying but cannot make it impossible.' },
            { q: 'Which DPI should I choose?', a: '150 DPI is fine for reading on screen, 200 DPI is a good all-rounder, and 300 DPI suits sharp printing.' },
            { q: 'Can I make it searchable again later?', a: 'Yes. Run OCR PDF on the rasterized file to add a searchable text layer on top of the images.' }
        ]
    },
    'insert-blank-pages': {
        intro: 'Insert Blank Pages adds empty pages to a PDF exactly where you need them: at the start, at the end, after every few pages, or after the pages you choose. Add one blank page or several each time, sized to match the page next to them or as A4 or Letter. A page strip shows the new order before you save, and your existing pages are copied as they are.',
        howItWorks: [
            'Drop a PDF into Insert Blank Pages.',
            'Choose where the blank pages go and how many to add each time.',
            'Pick a page size and check the new order in the page strip.',
            'Add the pages and download the new PDF. It is built on your device.'
        ],
        useCases: [
            { title: 'Space for notes', body: 'Add a blank page after every page of lecture slides so you have room to write notes when printed.' },
            { title: 'Double-sided printing', body: 'Add a blank page so chapters start on the right-hand side when the document is printed on both sides.' },
            { title: 'Room for signatures', body: 'Add an empty page at the end of a contract or form for signatures, stamps or handwritten comments.' }
        ],
        faqs: [
            { q: 'Does it change my existing pages?', a: 'No. Your pages keep their text, images and links. The tool only adds new empty pages between them.' },
            { q: 'How do I add blank pages after specific pages?', a: 'Choose After specific pages and type the page numbers, like 2, 5, or a range like 3-6.' },
            { q: 'Can I remove blank pages instead?', a: 'Yes. Use Remove Blank Pages to find and remove empty pages from a PDF.' }
        ]
    },
    'alternate-mix-pdf': {
        intro: 'Many home and office scanners only scan one side of a page. To copy a double-sided document you scan the fronts, flip the stack, and scan the backs, which leaves you with two files and the back pages in reverse. Alternate & Mix Pages puts them back together by taking a page from each file in turn, so every back page lands right behind its front. It also works for any PDFs you want to interleave.',
        howItWorks: [
            'Drop two or more PDFs and put them in the order they should take turns.',
            'Turn on Reverse for any file scanned last page first, or press Collate double-sided scans.',
            'Choose how many pages to take from each file per turn and what happens when one file runs out.',
            'Download the combined PDF. Your original files stay untouched, and nothing is uploaded.'
        ],
        useCases: [
            { title: 'Double-sided documents on a single-sided scanner', body: 'Scan all the fronts, then all the backs, and merge them into one correctly ordered PDF.' },
            { title: 'Questions and answers side by side', body: 'Put each worksheet page next to its answer page, or each original next to its translation.' },
            { title: 'Slides with notes pages', body: 'Take one slide, then two pages of notes, and repeat, by setting how many pages each file gives per turn.' }
        ],
        faqs: [
            { q: 'Why are my back pages in reverse order?', a: 'When you flip a scanned stack to scan the other side, the last sheet goes through first. Turn on Reverse for that file, or use Collate double-sided scans.' },
            { q: 'What happens if one file has more pages than the other?', a: 'By default the leftover pages are added at the end. You can choose to stop instead, which leaves out pages that have no partner.' },
            { q: 'Does it change the quality of my pages?', a: 'No. Pages are copied as they are, so text stays selectable and images keep their quality.' }
        ]
    },
    'divide-pages': {
        intro: 'Scanning a book or magazine flat on the glass gives you two pages on every image. Divide Pages cuts each of those spreads down the middle so you get one page per page, in the right reading order. It can also split pages into top and bottom halves, or into a grid for printing a large poster on ordinary paper. Pages are not turned into images, so text stays sharp and selectable.',
        howItWorks: [
            'Drop a PDF into Divide Pages.',
            'Choose left and right, top and bottom, or a grid. The preview shows the cut lines.',
            'Pick the reading order, which pages to divide, and whether to keep the covers whole.',
            'Download the divided PDF. Your original file stays untouched, and nothing is uploaded.'
        ],
        useCases: [
            { title: 'Scanned books and notebooks', body: 'Turn two-page spreads into single pages that are easier to read on a phone, search, or print.' },
            { title: 'Right-to-left books', body: 'For Arabic, Hebrew, Japanese and other right-to-left books, choose right to left so the right half comes first.' },
            { title: 'Posters and large drawings', body: 'Divide a big page into a grid, print each part on its own sheet and tape them together.' }
        ],
        faqs: [
            { q: 'Will my text become an image?', a: 'No. Each part shows a section of the original page, so text stays selectable and drawings stay sharp.' },
            { q: 'Does the file get smaller?', a: 'Not by much. The hidden part of each page is still in the file, just outside the visible area. Use Compress PDF afterwards if size matters.' },
            { q: 'Are links and form fields kept?', a: 'Pages that are divided lose their links and form fields. Pages that stay whole keep them.' }
        ]
    },
    'pdf-booklet': {
        intro: 'To make a folded, stapled booklet, pages have to be printed out of order: the last page next to the first, the second next to the second last, and so on. Make a Booklet does that arranging for you. It adds blank pages so the count works, places two pages side by side on each sheet, and gives you a PDF you can print double-sided, fold in half and staple.',
        howItWorks: [
            'Drop a PDF into Make a Booklet.',
            'Choose the paper size, which side the fold goes on, and where any blank pages should go.',
            'Check the sheet order preview to see which pages print on each sheet.',
            'Download the PDF, print it double-sided with flip on short edge, then fold and staple.'
        ],
        useCases: [
            { title: 'Event programmes and menus', body: 'Print a small folded programme for a wedding, concert or service on ordinary office paper.' },
            { title: 'Zines and small magazines', body: 'Turn a finished layout into print-ready sheets without a desktop publishing app.' },
            { title: 'Pocket manuals', body: 'Make an A5 or half-letter booklet from a full-size document.' }
        ],
        faqs: [
            { q: 'How should I print the booklet?', a: 'Print double-sided and choose flip on short edge. Keep the sheets in order, fold the stack in half and staple along the fold.' },
            { q: 'Why were blank pages added?', a: 'Every folded sheet holds four pages, so a booklet needs a page count divisible by 4.' },
            { q: 'Are links and form fields kept?', a: 'No. The booklet is meant for printing, so each page is placed on the sheet as it looks, without links or fillable fields.' }
        ]
    },
    'bates-numbering': {
        intro: 'Bates numbers give every page in a set of documents its own identifier, like ABC000001, so anyone can point to an exact page. They are standard in legal discovery, audits and records requests. Bates Numbering stamps those numbers on every page of one PDF or a whole batch, in the order you choose, and shows the range each file received. Confidential documents never leave your device.',
        howItWorks: [
            'Drop one or more PDFs and drag them into the order they should be numbered.',
            'Set the prefix, suffix, start number and number of digits, and pick where the stamp goes.',
            'Choose whether numbering continues from file to file or restarts for each one.',
            'Download the numbered files, as a single PDF or a ZIP when there are several.'
        ],
        useCases: [
            { title: 'Legal discovery and document production', body: 'Number every page produced so each one can be cited and tracked without confusion.' },
            { title: 'Audits and compliance reviews', body: 'Give invoices, statements and records a unique page reference before sharing them with an auditor.' },
            { title: 'Exhibits and case bundles', body: 'Stamp a matter code on every exhibit and keep numbering continuous across the whole bundle.' }
        ],
        faqs: [
            { q: 'What is a Bates number?', a: 'A unique identifier stamped on each page of a document set, usually a prefix followed by a zero-padded number such as ABC000001.' },
            { q: 'Can numbering continue across several files?', a: 'Yes. With Continue selected, the next file starts where the previous one ended. Choose Restart to begin every file from the start number.' },
            { q: 'Can I use any characters in the prefix?', a: 'The prefix and suffix can use English letters, numbers, spaces and common symbols. Accented letters and other alphabets are not supported by the stamp font.' }
        ]
    },
    'fill-pdf-form': {
        intro: 'Many PDFs arrive with boxes to fill in: job applications, tax forms, school enrolment, rental agreements. Fill PDF Form lists every field in the file, grouped by page, with the right control for each one, and shows the page with each field highlighted so you know which box you are filling. When you are done, download a copy that can still be edited, or flatten it so the answers become part of the page.',
        howItWorks: [
            'Drop a PDF form into Fill PDF Form.',
            'Orbit finds every fillable field and shows it with its current answer, grouped by page, next to a page preview.',
            'Type your answers, tick boxes and pick options. Click a highlighted box on the preview to jump to that field.',
            'Choose to keep the fields editable or flatten them, then download the filled PDF.'
        ],
        useCases: [
            { title: 'Applications and registrations', body: 'Complete job, visa, school or club forms without printing, handwriting and scanning them back in.' },
            { title: 'Sending a final copy', body: 'Flatten the form before emailing it so the answers cannot be changed by accident.' },
            { title: 'Private documents', body: 'Forms often ask for addresses, ID numbers and bank details. Filling them here means none of that is uploaded.' }
        ],
        faqs: [
            { q: 'Why does it say my PDF has no fillable fields?', a: 'Some forms only look fillable: the boxes are printed on the page with no real fields behind them. For those, use Edit PDF to add text on top of the page.' },
            { q: 'Why is my form not supported?', a: 'Some forms are dynamic XFA forms that only Adobe Acrobat and Reader can fill. Open them there or ask the sender for a standard PDF form.' },
            { q: 'Why can I not type some characters?', a: 'Answers are drawn with a built-in font that covers Latin letters, including accents, but not scripts such as Hindi, Chinese or emoji.' }
        ]
    },
    'overlay-pdf': {
        intro: 'Overlay PDF lays the pages of one PDF over, or under, the pages of another. Put your company letterhead behind a plain letter, stamp every page with a Confidential or Draft template, or add a designed background to a report. Pick on top or underneath, which overlay pages to use, which pages to change, how see-through it should be, and whether it scales to fit. Your pages keep their text, links and form fields.',
        howItWorks: [
            'Drop the document you want to change, then add the overlay PDF, such as a letterhead or stamp.',
            'Choose on top or underneath, and how overlay pages are matched to your pages.',
            'Pick all pages or a range, set the opacity and size, and check the preview.',
            'Apply the overlay and download the new PDF. Both original files stay untouched.'
        ],
        useCases: [
            { title: 'Letterhead on letters and invoices', body: 'Write on plain pages, then place your letterhead underneath so every page looks like official stationery.' },
            { title: 'Confidential or Draft stamps', body: 'Put a stamp page on top of every page, with some transparency so the content stays readable.' },
            { title: 'Pre-printed templates', body: 'Line up filled-in content with a blank form or certificate template, page by page.' }
        ],
        faqs: [
            { q: 'Why can I not see my letterhead when I put it underneath?', a: 'Some PDFs paint a solid white rectangle behind their content, which covers anything underneath. Try placing the overlay on top with lower opacity.' },
            { q: 'What if the two PDFs are different sizes?', a: 'Fit the page scales the overlay to fit inside each page and centres it. Original size keeps it at its own size.' },
            { q: 'Is the preview exact?', a: 'The preview is a quick approximation to check placement. The downloaded PDF is built from the real page content.' }
        ]
    },
    'pdf-attachments': {
        intro: 'A PDF can carry other files inside it: a spreadsheet behind a report, the XML data of an e-invoice, source files, or photos pinned to a page. Most viewers hide them away. PDF Attachments lists every embedded file with its name, size and description. Save any of them, download them all as a ZIP, remove the ones you do not want to share, and attach new files before saving a fresh copy.',
        howItWorks: [
            'Drop a PDF into PDF Attachments.',
            'Orbit lists every file stored in the document, including files pinned to individual pages.',
            'Download files one by one or all at once, mark the ones to remove, and add new files.',
            'Save the PDF to download a copy with your changes. The original file is not changed.'
        ],
        useCases: [
            { title: 'E-invoices', body: 'Pull the XML data out of ZUGFeRD or Factur-X invoices for your accounting software.' },
            { title: 'Cleaning a file before sharing', body: 'Remove drafts, spreadsheets or source files that were attached by accident before sending the PDF on.' },
            { title: 'Keeping supporting files together', body: 'Attach the spreadsheet, data or images behind a report so they travel inside the same PDF.' }
        ],
        faqs: [
            { q: 'Why is my PDF showing no attachments?', a: 'The file has none, or it only links to files elsewhere instead of storing them.' },
            { q: 'Are my files uploaded anywhere?', a: 'No. The PDF and every attachment are read and saved on your device.' },
            { q: 'Can I attach any kind of file?', a: 'Yes. Any file type can be embedded. Large attachments make the PDF bigger by roughly their own size.' }
        ]
    }
};
