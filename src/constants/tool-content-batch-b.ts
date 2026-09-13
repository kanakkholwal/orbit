import type { ToolContent } from './tool-content';

export const toolContentBatchB: Record<string, Partial<ToolContent>> = {
    'bookmark-pdf': {
        intro: 'A long PDF without bookmarks forces readers to scroll or guess page numbers to find a chapter. Bookmark PDF lets you build the clickable outline that appears in the sidebar of Acrobat, Preview, Edge and most other readers. Flip to a page, type a name, and the bookmark points there. You can nest bookmarks inside each other for sections and subsections, rename or remove them, and pull in the outline the file already has as a starting point. The PDF is opened and saved on your device.',
        howItWorks: [
            'Drop a PDF, then use the arrows beside "Page 1 of 10" to reach the page a bookmark should open.',
            'Type a name under "Add a bookmark" and press Add, or click "Import bookmarks from this PDF" to start from the existing outline.',
            'Select a bookmark to Rename it, "Add inside" for a subsection, "Use page" to point it at the page you are viewing, or Remove it. Undo and Redo are above the list.',
            'Click "Save bookmarked PDF" to download a copy ending in _bookmarked.pdf.'
        ],
        useCases: [
            { title: 'Theses and dissertations', body: 'University submission rules often ask for a navigable PDF. Add bookmarks for each chapter, appendix and the bibliography so examiners can jump around the document.' },
            { title: 'Scanned books and manuals', body: 'A scanned manual has no outline at all. Add one bookmark per chapter while paging through, so the next person does not have to hunt for the troubleshooting section.' },
            { title: 'Merged document bundles', body: 'After merging contracts, invoices and schedules into one file, bookmark the first page of each original so the bundle reads like a binder with tabs.' },
            { title: 'Fixing a broken outline', body: 'Import an outline with wrong page targets or typos, correct the names and pages, and save it back.' }
        ],
        faqs: [
            { q: 'Will saving keep the bookmarks my PDF already had?', a: 'Only the bookmarks in your list are written to the new file, and they replace the old outline. To keep the existing ones, click "Import bookmarks from this PDF" first and edit from there.' },
            { q: 'Do bookmarks that use named destinations import correctly?', a: 'Yes. Bookmarks that point to a page directly, through a named destination or through a "go to" link all open the right page. If a target is missing from the file, the bookmark falls back to page 1. Select it, go to the right page and click "Use page" to fix it.' },
            { q: 'Can I create sub-bookmarks?', a: 'Yes. Select a bookmark and choose "Add inside". Nested bookmarks appear indented under their parent and can be expanded or collapsed in the list.' },
            { q: 'Are bookmark colours or bold styling imported?', a: 'Yes. Imported bookmarks keep their names, pages, nesting, colour, bold and italic styling, and whether each group starts open or collapsed, and all of it is written back when you save.' }
        ]
    },
    'add-page-no-pdf': {
        intro: 'Printed reports, court bundles and exam papers are hard to discuss when nobody can say which page they mean. Add Page Numbers stamps a number on every page of a PDF in one of six spots, top or bottom, left, centre or right. Choose plain numbers or the "1 of 10" style, pick a colour and size, set how far the number sits from the edge, and skip a cover by starting on a later page. A live preview shows the result before you save, and the file is processed in your browser.',
        howItWorks: [
            'Drop a single PDF. The page count appears next to the file name.',
            'Pick a Position on the grid and a Style: "1, 2, 3" or "1 of 10".',
            'Set "Start numbering on page", then adjust Colour, Size (6 to 72 pt) and "Distance from edge" while watching the preview.',
            'Click the Number button to download a copy ending in _numbered.pdf.'
        ],
        useCases: [
            { title: 'Legal and court bundles', body: 'Bundles are referred to by page in hearings and letters. Number every page at the bottom right so everyone points to the same sheet.' },
            { title: 'Reports with a cover page', body: 'Start numbering on page 2 so the cover stays clean while the content pages carry their numbers.' },
            { title: 'Printed handouts and exam papers', body: 'Loose printed sheets get shuffled. A "3 of 12" footer makes it obvious when a page is missing.' },
            { title: 'Scanned documents', body: 'Scans come out of the scanner with no numbering. Add it afterwards without rescanning anything.' }
        ],
        faqs: [
            { q: 'If I start on page 3, does that page show 1 or 3?', a: 'It shows 3. Numbering follows the real position of each page in the file, and earlier pages are simply left without a number. In "1 of 10" style, the total also counts those unnumbered pages.' },
            { q: 'Can I choose the font?', a: 'The numbers use Helvetica, a clean sans-serif that every PDF reader can display. You can change the size and colour, but not the typeface.' },
            { q: 'Will the number cover text near the edge of my pages?', a: 'It can, if your pages have content close to the edge. Increase "Distance from edge" or move the number to another position, and check the preview before saving.' },
            { q: 'Why is the number on the side of some pages?', a: 'Some PDFs store a page sideways and tell the reader to turn it for display. The number is placed on the stored page, so it can end up along a side edge. Check rotated pages after saving.' }
        ]
    },
    'add-watermark-pdf': {
        intro: 'Before sending a draft contract, a set of proofs or a document meant only for internal eyes, people often want a clear label on every page. Add Watermark places a word such as CONFIDENTIAL or DRAFT, or a PNG or JPG logo, across the centre of each page. You control the size, opacity and angle, and for text the colour too, with a preview that updates as you move the sliders. The stamp is drawn over the page content, and the PDF is never sent anywhere to do it.',
        howItWorks: [
            'Drop a PDF and choose Text or Image under Type.',
            'For text, type the words and pick a Colour and Size. For an image, click "Choose an image" and select a PNG or JPG.',
            'Adjust Opacity and Angle until the preview looks right. The same watermark goes on every page.',
            'Click "Add watermark" to download a copy ending in _watermarked.pdf.'
        ],
        useCases: [
            { title: 'Draft documents', body: 'Mark contracts, policies and designs as DRAFT so an early version is never mistaken for the signed one.' },
            { title: 'Sharing ID and bank documents', body: 'When a landlord or employer asks for a copy of a passport or statement, add a line such as "For rental application only" to discourage reuse elsewhere.' },
            { title: 'Portfolio and proof sheets', body: 'Put a semi-transparent studio logo over photo proofs or design samples sent to a client before payment.' },
            { title: 'Internal reports', body: 'Stamp CONFIDENTIAL at a low opacity so the label is obvious without making the figures hard to read.' }
        ],
        faqs: [
            { q: 'Can someone remove the watermark?', a: 'A watermark is a visible deterrent, not a lock. Someone with a PDF editor could delete it. To make it much harder to strip out, run the result through Rasterize PDF so each page becomes a single image, or restrict editing with Encrypt PDF.' },
            { q: 'Why does my text watermark fail with some characters?', a: 'Text watermarks use the built-in Helvetica Bold font, which covers Latin letters, numbers and common symbols. Characters outside that set, such as Chinese, Arabic or emoji, cannot be drawn. Use an image watermark with the text saved as a PNG instead.' },
            { q: 'Can I put the watermark in a corner?', a: 'No. Text and images are always placed around the centre of each page. You can change the size, angle and opacity, but not the position.' },
            { q: 'Does it work on password-protected PDFs?', a: 'Files that need a password to open cannot be watermarked. Remove the protection with Decrypt PDF first, then add the watermark.' }
        ]
    },
    'delete-pages': {
        intro: 'Scanned blank backs, an outdated appendix, a page with personal details you should not forward: sometimes a PDF just has pages that need to go. Delete PDF Pages shows a thumbnail of every page so you can tap the ones to drop, or type page numbers and ranges such as 1, 3-5, 8. A running count shows how many pages will be left, and the tool will not let you delete every page by accident. The new, shorter PDF is built in your browser.',
        howItWorks: [
            'Drop a PDF. A thumbnail appears for every page.',
            'Tap the pages you want gone, or type them into "Page numbers" as single pages and ranges.',
            'Check the Result panel: "Pages now", "To delete" and "Pages left". Use "Select all" or "Clear selection" to start again.',
            'Click the Delete button to download a copy ending in _deleted.pdf.'
        ],
        useCases: [
            { title: 'Removing personal pages before sharing', body: 'Drop the page with bank details or a signature from a document before sending the rest to a colleague or agency.' },
            { title: 'Cleaning up scans', body: 'Double-sided scanning often captures blank or upside-down backs. Tap them out from the thumbnails in one pass.' },
            { title: 'Trimming downloaded reports', body: 'Keep the executive summary and the chapters you need, and remove the marketing pages and legal boilerplate.' }
        ],
        faqs: [
            { q: 'How do I delete a range of pages?', a: 'Type it into "Page numbers" with a hyphen, for example 10-25. Mix ranges and single pages with commas, like 1, 4-6, 12. The thumbnails update to match what you type.' },
            { q: 'Can I delete every page except one?', a: 'Yes. The PDF just has to keep at least one page. If every page is selected, the Delete button stays disabled until you unselect one.' },
            { q: 'Are bookmarks kept after deleting pages?', a: 'No. The remaining pages are copied into a new file, and the bookmark outline is not carried over. Add it back with Bookmark PDF if you need it.' },
            { q: 'Should I use this or Extract PDF Pages?', a: 'Use Delete PDF Pages when you know which few pages to drop. When you only want a handful of pages out of a long file, Extract PDF Pages lets you pick the ones to keep instead.' }
        ]
    },
    'header-footer': {
        intro: 'Company names, report titles, dates and "Page 4 of 20" lines are expected on formal documents, but the PDF you exported may not have them. Add Header & Footer gives you six text boxes, left, centre and right at the top and bottom of the page. Insert page number and total page placeholders that fill in on each page, limit the text to certain pages, and set one colour and size for all of it. The preview shows how the first affected page will look, and the text is added locally in your browser.',
        howItWorks: [
            'Drop a PDF and type into any of the Header and Footer boxes: Left, Centre or Right.',
            'Click in a box and press "Page number" or "Total pages" to insert {page} or {total} there.',
            'Leave Pages empty for every page, or type something like 2-10. Then choose a Colour and "Text size".',
            'Click the "Add to" button to download a copy ending in _header_footer.pdf.'
        ],
        useCases: [
            { title: 'Client deliverables', body: 'Put the client name on the left of the header, the project title in the centre, and the delivery date on the right before the report goes out.' },
            { title: 'Confidential footers', body: 'Add "Confidential, not for distribution" in the footer of a board pack or HR document exported from a tool that has no footer option.' },
            { title: 'Coursework and submissions', body: 'Add your student number and "Page {page} of {total}" to an assignment PDF, skipping the title page with a page range.' }
        ],
        faqs: [
            { q: 'How do I show "Page 3 of 12"?', a: 'Type "Page {page} of {total}" into a box, or type "Page ", click "Page number", type " of " and click "Total pages". Each page gets its own number and the total is the page count of the whole file.' },
            { q: 'Can I use a different size or colour for the header and the footer?', a: 'Not in one pass. One colour and text size apply to all six boxes. For different styles, add the header, then run the downloaded file through the tool again for the footer.' },
            { q: 'Can I use non-English text in the header?', a: 'The text is set in Helvetica, which handles English and most Western European accented letters. Scripts such as Cyrillic, Greek, Arabic, Hindi or Chinese are not supported by that font and will cause an error.' },
            { q: 'What if my page already has text near the top or bottom?', a: 'The header and footer sit 40 points (about 14 mm) in from the edges and are drawn on top of the page, so they can overlap content in that area. Check the preview, and use a smaller text size if space is tight.' }
        ]
    },
    'background-color': {
        intro: 'Bright white pages can be tiring to read for long stretches, and some readers with dyslexia or visual stress find a cream or pastel tint easier. Change Background Color puts a solid colour behind the content of every page, or only the pages you list. Pick one of the tints (Cream, Mint, Sky, Rose, Light grey) or any custom colour, and the preview shows it behind sample text. Everything happens on your device, so worksheets and books are never uploaded.',
        howItWorks: [
            'Drop a PDF to see a preview page.',
            'Choose a swatch under Colour, or click "Custom colour" to pick any shade.',
            'Leave Pages empty to colour the whole document, or enter pages such as 1-3, 5.',
            'Click the Colour button to download a copy ending in _bg_changed.pdf.'
        ],
        useCases: [
            { title: 'Reading support', body: 'Tint study notes, reading packs or novels in cream or pale blue for readers who find black on white harsh or blurry.' },
            { title: 'Section dividers', body: 'Colour only the divider pages of a long training manual so each part is easy to spot when flicking through.' },
            { title: 'Matching brand colours', body: 'Give the cover and closing page of a proposal a light brand tint without reopening the original design file.' }
        ],
        faqs: [
            { q: 'Why did the colour not appear on some pages?', a: 'The colour sits behind everything on the page. Scanned pages and pages built on a full-page white image cover it completely. For those, PDF Color Filters is a better fit.' },
            { q: 'Will my links still work on coloured pages?', a: 'Pages you colour are redrawn on a new page, and clickable links, comments and form fields on those pages are not kept. Pages outside your range are copied unchanged.' },
            { q: 'Can I use a gradient or picture as the background?', a: 'No. The background is a single solid colour. Any colour can be picked, including dark ones, but dark shades make black text harder to read.' },
            { q: 'Is the text still selectable after the change?', a: 'Yes. The original page content is placed on top of the colour, so its text can still be selected, searched and copied.' }
        ]
    },
    'remove-annotations': {
        intro: 'A PDF that has been through review often carries sticky notes, yellow highlights, drawn circles and approval stamps that should not reach the final reader. Remove Annotations counts every mark sitting on top of the pages and deletes all of them in one step, leaving the actual page text and images untouched. It also clears clickable links and fillable form fields, because PDFs store those the same way. The count appears as soon as you open the file, and the cleanup runs in your browser.',
        howItWorks: [
            'Drop a PDF. The file row shows how many marks were found, for example "14 marks found".',
            'Read "What gets removed": comments and sticky notes, highlights, drawings and stamps, clickable links, and fillable form fields.',
            'Click "Remove annotations". If the file has no marks, the button stays disabled.',
            'The clean copy downloads with a name ending in _no_annotations.pdf.'
        ],
        useCases: [
            { title: 'Sending the final version', body: 'Strip reviewer comments and tracked-change style highlights from a contract or article before it goes to the other party or the publisher.' },
            { title: 'Reusing marked-up textbooks', body: 'Get a clean copy of a PDF chapter you or a previous student highlighted, ready to annotate again from scratch.' },
            { title: 'Removing leftover form fields', body: 'Clear empty or half-filled form boxes from a template that you want to print as a plain document.' }
        ],
        faqs: [
            { q: 'Can I remove only the comments and keep the links?', a: 'No. Every annotation on every page is removed together, including links and form fields. If you need links to keep working, keep a copy of the original.' },
            { q: 'Why is a highlight still visible after cleaning?', a: 'Some apps burn highlights and drawings into the page itself when saving or printing to PDF. Those are part of the page content, not annotations, so they cannot be lifted off.' },
            { q: 'What happens to text I typed into a form?', a: 'Form fields are removed along with their typed answers. To keep the answers, use Flatten PDF instead, which turns filled fields and marks into fixed page content rather than deleting them.' },
            { q: 'Does it delete hidden comments too?', a: 'Yes. Comments that are collapsed, hidden or only shown in a sidebar are still annotations on the page, so they are counted and removed.' }
        ]
    },
    'remove-blank-pages': {
        intro: 'Duplex scanners, mail merges and exported slide decks regularly leave empty pages scattered through a PDF. Remove Blank Pages renders each page and measures how bright it is overall, then shows you thumbnails of the ones that look empty, already ticked for removal. You choose how forgiving the check is, from truly empty pages to scanned sheets with dust and smudges, and tap any page you want to keep. Pages are checked on your own device, not on a server.',
        howItWorks: [
            'Drop a PDF. Orbit starts checking every page straight away and shows its progress.',
            'Under "What counts as blank", choose "Only empty pages", "Nearly empty" or "Scanned pages", then press "Check again" if you changed it.',
            'Review the thumbnails. Every detected page starts marked Remove; tap one to switch it to Keep.',
            'Click the Remove button to download a copy ending in _no_blank.pdf.'
        ],
        useCases: [
            { title: 'Double-sided scans', body: 'A stack of single-sided letters scanned in duplex mode comes out with a blank back after every page. Use "Scanned pages" to catch backs with faint marks too.' },
            { title: 'Mail merge output', body: 'Merged letters and certificates sometimes include an empty page between records. Remove them before printing a run of hundreds.' },
            { title: 'Printing costs', body: 'Remove the empty separator pages from a long export so you are not paying to print sheets of nothing.' }
        ],
        faqs: [
            { q: 'How does it decide a page is blank?', a: 'Each page is rendered as a small image and its average brightness is measured. A page that is almost entirely white passes. "Only empty pages" is the strictest setting and "Scanned pages" is the most forgiving.' },
            { q: 'Why was a page with a little text flagged as blank?', a: 'A page with a single short line, like "This page intentionally left blank", can still be bright enough on average to pass, especially with "Scanned pages". That is why pages are shown for review first. Tap it to keep it.' },
            { q: 'Why are my empty pages not being found?', a: 'The check looks for near-white pages. Blank pages scanned on grey or yellowed paper, or pages with a coloured background, are too dark to count. Try "Scanned pages", or remove them by hand with Delete PDF Pages.' },
            { q: 'Can it remove duplicate slide pages?', a: 'No. Pages that are earlier steps of an animated slide are not blank. Use Strip PDF for presentation exports instead.' }
        ]
    },
    'extract-images': {
        intro: 'Taking screenshots of a PDF to save a photo gives you a blurry copy at screen resolution. Extract Images from PDF instead pulls out the picture files stored inside one or more PDFs, in the format and resolution they were saved with, so a JPEG photo comes out as that same JPEG. You get a grid of every image found with its file size, can download any single one, or save them all in a ZIP. The PDFs are read in your browser and nothing is uploaded.',
        howItWorks: [
            'Drop one or more PDFs. Use "Add files" to include more before you start.',
            'Click the "Find images" button. Orbit loads its PDF engine and searches each page of each file.',
            'Browse the grid of results. Each image shows its name and size, with a download button on the thumbnail.',
            'Save single images, or click "Download all as ZIP" to get extracted-images.zip.'
        ],
        useCases: [
            { title: 'Recovering photos from a brochure', body: 'When the only copy of a product shot or event photo is inside a PDF brochure, pull out the original file rather than cropping a screenshot.' },
            { title: 'Reusing figures from a paper', body: 'Save the embedded photos and microscope images from a research paper for slides or notes, with credit to the authors.' },
            { title: 'Getting scans back out', body: 'A PDF made from scanned pages or phone photos stores each page as an image. Extract them to get the page images back as separate files.' }
        ],
        faqs: [
            { q: 'Why are charts and diagrams missing from the results?', a: 'Many charts, logos and diagrams are drawn as vector shapes rather than stored as pictures, so there is no image file to extract. Use PDF to Image to save the whole page as a picture instead.' },
            { q: 'Why do I get the same image several times?', a: 'Images are collected page by page, so a logo that appears in the header of ten pages can be listed ten times. Download just the ones you need rather than the whole ZIP.' },
            { q: 'Why does a logo have a black or solid background?', a: 'PDFs often store transparency as a separate mask next to the image. The extracted file is the image itself, so see-through areas may come out filled.' },
            { q: 'Are images compressed or resized?', a: 'No. Each image is saved exactly as it is stored in the PDF. Uncommon formats such as JPEG 2000 are kept as they are too, which means some photo viewers may not open them.' }
        ]
    },
    'txt-to-pdf': {
        intro: 'Plain .txt files are handy for notes, logs and exported chat transcripts, but they look different on every device and are awkward to print or attach to a formal email. Text to PDF turns one or several text files, or text you type or paste, into a paginated PDF. Choose a font, text colour, text size and page size from A5 to A3, and long lines wrap inside a one-inch margin. Spaces and tabs are kept, so columns stay lined up in Courier. The PDF is created on your computer.',
        howItWorks: [
            'Choose "Text files" and drop one or more .txt files, or switch to "Type text" and type, paste or click "Open a file".',
            'Pick a Font (Helvetica, Times or Courier) and a Colour.',
            'Set the Size in points and a "Page size" of A4, Letter, Legal, A5 or A3.',
            'Click "Create PDF" to download text_to_pdf.pdf.'
        ],
        useCases: [
            { title: 'Printing log files and transcripts', body: 'Turn a server log, chat export or interview transcript into pages that wrap long lines and print cleanly instead of running off the edge.' },
            { title: 'Combining notes into one document', body: 'Drop a folder of daily .txt notes to join them into a single PDF you can read on a tablet or share.' },
            { title: 'Attaching text to forms', body: 'Some upload portals only accept PDF. Paste a cover letter or statement and get a PDF to attach in a few seconds.' }
        ],
        faqs: [
            { q: 'When I add several files, does each start on a new page?', a: 'Yes. Files are added in the order listed, and each one starts on a fresh page, so a short note never runs into the end of the previous file.' },
            { q: 'Are spaces and tabs kept exactly?', a: 'Yes. Line breaks and runs of spaces are kept, and each tab moves to the next stop every 4 characters. Choose Courier for text lined up in columns, such as an ASCII table or a log, since its letters all have the same width.' },
            { q: 'Why do accented letters look garbled?', a: 'Files are read as UTF-8. Older text files saved in another encoding, such as Windows-1252, can show strange symbols in place of accents. Re-save the file as UTF-8 in your text editor and convert again.' },
            { q: 'Does it work with Arabic, Hebrew, Cyrillic or Chinese text?', a: 'Yes. Text in Western European languages uses the fast built-in fonts. When your text needs other scripts, Orbit downloads a wider set of fonts the first time and uses them instead. In that case every file flows on one after another, rather than starting on a new page.' }
        ]
    },
    'pdf-to-docx': {
        intro: 'Retyping a PDF because you need to change a few paragraphs wastes an afternoon. PDF to Docx converts PDFs into Word documents you can open and edit in Microsoft Word, Pages, LibreOffice or Google Docs. It rebuilds paragraphs, tables and images from each page and tries to keep them in a similar layout. Convert several PDFs at once and get a ZIP of .docx files. The conversion engine runs inside your browser, so contracts and CVs stay on your machine.',
        howItWorks: [
            'Drop one or more PDFs, and use "Add files" to queue more.',
            'Click the Convert button. Files are converted one at a time, with a progress line showing which file is being converted.',
            'Each finished file is marked done and shows the size of its Word file, with its own download button.',
            'A single conversion downloads as a .docx with the same name. Several download together as converted-documents.zip.'
        ],
        useCases: [
            { title: 'Updating an old CV or cover letter', body: 'When the original Word file is lost and only the PDF is left, convert it back and edit the dates and job titles directly.' },
            { title: 'Editing a contract draft', body: 'Turn the PDF a counterparty sent into a document you can mark up with suggested wording in Word.' },
            { title: 'Reusing report content', body: 'Pull paragraphs and tables from a published PDF report into a new document without retyping the figures.' }
        ],
        faqs: [
            { q: 'Will the Word file look exactly like the PDF?', a: 'Not always. Simple documents with paragraphs, headings and bordered tables usually convert closely. Multi-column layouts, text over images, unusual fonts and complex forms can shift, break into separate boxes, or use substitute fonts. Expect to tidy the result.' },
            { q: 'Can it convert a scanned PDF?', a: 'A scanned page is a picture, so the Word file will contain that picture rather than editable text. Run OCR PDF first to add a text layer, then convert, and check the result carefully.' },
            { q: 'Why did one file fail while others converted?', a: 'Damaged or password-protected PDFs can stop the converter. That file is marked "Could not convert this file" and the rest continue. Try Repair PDF or Decrypt PDF, then convert it again.' },
            { q: 'Why is the first conversion slow?', a: 'The converter is a full document engine that downloads and starts in your browser on first use. Pages with many tables or images also take longer to rebuild than plain text pages.' }
        ]
    }
};
