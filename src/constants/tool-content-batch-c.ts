import type { ToolContent } from './tool-content';

export const toolContentBatchC: Record<string, Partial<ToolContent>> = {
    'pdf-to-excel': {
        intro: 'Copying a table out of a PDF usually means pasting a jumble of text into Excel and fixing every row by hand. PDF to Excel looks through each page for tables, reads their rows and columns, and saves them as an .xlsx workbook. A file with one table gives you a single sheet; a file with several gives one sheet per table, named with the page it came from. It works best on PDFs made on a computer with clearly ruled tables, and the whole conversion runs on your own device.',
        howItWorks: [
            'Drop one or more PDFs, or use Add files to include more.',
            'Press Convert. Orbit checks every page of each file and shows how many tables it found.',
            'Each table becomes its own sheet, labelled like "Table 2 (Page 5)" when there is more than one.',
            'The spreadsheet downloads straight away, or as one ZIP for several PDFs. Files with no tables are marked "No tables found".'
        ],
        useCases: [
            { title: 'Bank and card statements', body: 'Pull the transaction table from a monthly statement into a sheet so you can sort, filter and total your spending.' },
            { title: 'Supplier price lists', body: 'Turn a price list that only arrives as a PDF into rows you can compare against last year\'s prices with a formula.' },
            { title: 'Published reports and data appendices', body: 'Government and research reports often put their figures in PDF tables. Get them into Excel to chart or analyse.' },
            { title: 'Invoices from many vendors', body: 'Convert a batch of invoices at once and collect the line items from each workbook.' }
        ],
        faqs: [
            { q: 'Why does it say "No tables found" for my PDF?', a: 'Detection relies on the layout of the page, and it works most reliably when tables have visible lines between rows and columns. Text laid out in loose columns without lines may not be recognised. Scanned pages contain only a picture of the table, so run OCR PDF first.' },
            { q: 'Will every cell land in the right column?', a: 'For clean, ruled tables it usually does. Merged cells, tables that break across pages and cells with several lines of text can shift or split, so check the sheet before relying on the numbers.' },
            { q: 'Does it keep text outside the tables, or the formatting?', a: 'No. Only the contents of detected tables are saved, as plain cell values. Headings, paragraphs, colours, fonts and cell borders are not copied.' },
            { q: 'Why did I get several sheets instead of one?', a: 'Each table found in the PDF gets its own sheet, so a statement split across four pages can produce four sheets. You can paste them together in Excel afterwards.' }
        ]
    },
    'pdf-for-ai': {
        intro: 'Pasting a long PDF into a chatbot or an AI app often loses page numbers, jumbles headings and breaks tables apart, which makes answers harder to trace back to the source. PDF for AI turns each PDF into a JSON file with one entry per page. Every entry holds that page\'s text in Markdown, so headings and lists keep their structure, alongside the file name, page number, total pages and the document\'s title and author when they are set. The format matches the Document objects used by LlamaIndex, and the conversion happens on your device.',
        howItWorks: [
            'Drop one or more PDFs to prepare.',
            'Press Prepare. Each file is read page by page and the number of sections found is shown next to it.',
            'Check the Preview panel, and use Copy to put the JSON on your clipboard.',
            'The file downloads as name_llm.json, or several files arrive together in one ZIP.'
        ],
        useCases: [
            { title: 'Building a document search or RAG app', body: 'Load the JSON straight into a LlamaIndex or similar pipeline, with page numbers ready for citing where an answer came from.' },
            { title: 'Confidential documents and local models', body: 'Prepare contracts or internal policies on your own machine and feed them to a model you run locally, without sending the PDF to a conversion service.' },
            { title: 'Research papers and manuals', body: 'Keep section headings and page references intact so a model can point to the right chapter of a long manual or paper.' }
        ],
        faqs: [
            { q: 'What does the JSON file contain?', a: 'An array with one object per page. Each object has a "text" field in Markdown and a "metadata" field with the file name, page number, total page count and any document details such as title, author or creation date. Detected tables and images on the page are listed in the metadata too.' },
            { q: 'Can I upload the JSON to ChatGPT or Claude?', a: 'Yes, any app that accepts text or JSON files can read it. For a quick one-off question, PDF to Text may be simpler; the JSON format is most useful when you want page numbers kept or are loading documents into your own tools.' },
            { q: 'Does it work on scanned PDFs?', a: 'Scanned pages are pictures with no text layer, so their entries come out mostly empty. Run the file through OCR PDF first, then prepare the result.' }
        ]
    },
    'view-metadata': {
        intro: 'Every PDF carries details you do not see on the page: who wrote it, which program made it, when it was created and last changed, and sometimes names left behind from an old template. View PDF Metadata shows all of it in one list with plain labels such as "Made with", "Saved as PDF by" and "Last changed". It also lists any fillable form fields with their current values and opens the extended XMP details that some apps store. Checking a file this way happens entirely in your browser.',
        howItWorks: [
            'Drop a single PDF. Its details are read as soon as it loads.',
            'Read the Document details list, which covers title, author, dates, PDF version, encryption and whether the file has signatures or a fillable form.',
            'Scroll to Form fields to see each field and its value, and expand Extra details (XMP) for the extended information.',
            'Copy one value with its copy button, or use Copy all to get every document detail as JSON. Press Check another file to look at a different PDF.'
        ],
        useCases: [
            { title: 'Before sending a file outside your company', body: 'See whether the author field still shows a colleague\'s name, an old client or an internal file path before the PDF goes to a customer.' },
            { title: 'Checking when a document was made', body: 'Compare the created and last changed dates with the date printed on a contract or letter.' },
            { title: 'Seeing which software produced a file', body: 'The "Made with" and "Saved as PDF by" fields show the original app, which helps when a printer or portal rejects a PDF.' },
            { title: 'Reviewing a filled-in form', body: 'List every field in a submitted form with its value, without clicking through each page.' }
        ],
        faqs: [
            { q: 'Can the dates in a PDF be trusted?', a: 'They show what the program that saved the file wrote, and anyone with an editing tool can change them. Treat them as a useful hint, not proof of when a document was really created.' },
            { q: 'What is XMP metadata?', a: 'XMP is a second, more detailed set of document information stored as XML inside the PDF. Apps like Adobe Acrobat and InDesign often write it. Orbit shows it as a tidy list, or as the raw text when it cannot be organised.' },
            { q: 'Why does it say the file doesn\'t store any document details?', a: 'Some PDF generators leave the information fields empty. The file still opens normally; it simply has nothing recorded there.' },
            { q: 'Does it work with password protected PDFs?', a: 'A PDF that needs a password to open cannot be read, and you will see a message saying the file may be damaged or locked. If you know the password, remove it first with Decrypt PDF.' }
        ]
    },
    'edit-metadata': {
        intro: 'When you open a PDF, many viewers and search results show its stored title rather than the file name, which is how a report ends up labelled "Microsoft Word - Draft3.docx". Edit PDF Metadata lets you rewrite that information: title, author, subject, keywords, the created and last changed dates, the apps listed as its maker, and your own custom details such as Department or Project. The current values are filled in for you, and a copy with your changes is saved. Your PDF is edited on your device, not on a server.',
        howItWorks: [
            'Drop a PDF. Its current title, author, subject, keywords and dates appear in the Document details form.',
            'Change the boxes you want. Leave a box empty to clear it, and separate keywords with commas.',
            'Under More details, edit "Made with" and "Saved as PDF by", or use Add a detail for your own name and value pairs.',
            'Press Save details. A copy named with "_metadata-edited" downloads, and the page content stays exactly as it was.'
        ],
        useCases: [
            { title: 'Fixing the title shown in browsers', body: 'Replace a leftover title like "Untitled" or an old file name so the PDF shows a proper name in the browser tab and in viewers.' },
            { title: 'Removing personal names before publishing', body: 'Clear the author field and the app names before posting a PDF publicly or sending it to someone outside your team.' },
            { title: 'Organising a document library', body: 'Add consistent keywords and custom details like Project or Client so files are easier to find with desktop search.' },
            { title: 'Correcting a wrong creation date', body: 'Set the created date to match when a scanned archive document was actually produced.' }
        ],
        faqs: [
            { q: 'Why does the old title still appear in some apps?', a: 'Orbit updates the standard document information in the PDF. Some files also keep a separate XMP copy of these details, and a few apps read that copy first. Orbit does not change the XMP data, so those apps may still show the old values.' },
            { q: 'What happens to the last changed date if I leave it empty?', a: 'It is set to the moment you press Save details. An empty created date leaves the original creation date in place.' },
            { q: 'What happens to custom details I remove?', a: 'The saved copy keeps only the custom details listed when you save. Any you remove are deleted from the file, and details with an empty name or value are left out.' },
            { q: 'Does editing metadata change how the PDF looks?', a: 'No. Only the hidden document information is rewritten. Pages, text, images and layout are not touched.' }
        ]
    },
    'reverse-pages': {
        intro: 'Scanners that feed paper face up, and printers that stack pages face up, often produce a PDF where the last page comes first. Reverse PDF Pages fixes that in one step by flipping the whole page order, so page 30 becomes page 1 and page 1 becomes page 30. You can drop several PDFs at once, and each file is reversed on its own rather than merged. The page content is copied as it is, with no change in quality, and everything runs locally in your browser.',
        howItWorks: [
            'Drop one or more PDFs into Reverse PDF Pages.',
            'Check the list. Use Add files for more, or remove any you added by mistake.',
            'Press Reverse. Each file shows how many pages were reversed.',
            'The reversed PDF downloads with "_reversed" in its name, or several arrive together in a ZIP.'
        ],
        useCases: [
            { title: 'Scans that came out backwards', body: 'A sheet feeder that scans the stack from the bottom up leaves you reading a document from the end. Reverse it before filing or sharing.' },
            { title: 'Double-sided scanning on a single-sided scanner', body: 'Scan the front sides, flip the stack and scan the back sides, then reverse the second file so the pages can be interleaved with Alternate & Mix Pages.' },
            { title: 'Printing on a face-up printer', body: 'Printers that stack sheets face up leave the first page at the bottom. Print a reversed copy and the stack comes out in order.' },
            { title: 'Chat and log exports', body: 'Some apps export conversations or activity logs newest first. Reverse the PDF to read them from the beginning.' }
        ],
        faqs: [
            { q: 'Can I reverse only some of the pages?', a: 'No, this tool flips the order of every page in the file. To move specific pages, use the Organize PDF tool, or split out the section you need first.' },
            { q: 'If I add several PDFs, are they combined?', a: 'No. Each PDF is reversed separately and keeps its own file. Use Merge PDF afterwards if you want them in one document.' },
            { q: 'Does reversing rotate the pages or mirror the text?', a: 'No. Only the order changes. Each page keeps its orientation and looks exactly as it did.' }
        ]
    },
    'pdf-to-text': {
        intro: 'Selecting text in a PDF viewer and copying it page by page is slow, and it often picks up stray headers or misses whole paragraphs. PDF to Text reads every page of a PDF and saves all its words as a plain .txt file that opens in any editor. A preview shows the result straight away, with a Copy text button and a character count for each file. It suits PDFs created on a computer; scanned pages have no text to read. The extraction runs locally, so the document stays on your device.',
        howItWorks: [
            'Drop one or more PDFs to pull text from.',
            'Press Save text. Each file shows how many characters were found, or "No text found".',
            'Read the Preview, and press Copy text to put everything on your clipboard.',
            'The .txt file downloads with the same name as the PDF, or several come as one ZIP.'
        ],
        useCases: [
            { title: 'Quoting from a report', body: 'Get the wording of a long report or policy into a text editor so you can search it and copy exact passages into your own notes.' },
            { title: 'Word counts and translation quotes', body: 'Translators and editors can paste the text into a word counter to price a job without retyping anything.' },
            { title: 'Feeding text into other tools', body: 'Plain text is easy to load into scripts, spreadsheets, screen readers or a chatbot prompt.' },
            { title: 'Archiving the words of old documents', body: 'Keep a small, searchable text copy of manuals and papers alongside the original PDFs.' }
        ],
        faqs: [
            { q: 'Why is the text file empty?', a: 'The PDF is probably a scan or a photo, which stores each page as a picture with no text inside. Use OCR PDF to recognise the words first.' },
            { q: 'Will tables, columns and formatting be kept?', a: 'No. The output is plain text, so bold, fonts, images and table borders are dropped. Table cells come out as separate lines, and text in multi-column layouts may not always follow the reading order you expect.' },
            { q: 'Are page breaks marked in the text file?', a: 'Pages follow one another with a line break between them, but there is no page number or separator. If you need page numbers kept, PDF for AI saves the text page by page.' }
        ]
    },
    'fix-page-size': {
        intro: 'A PDF assembled from different sources can mix A4, Letter, receipt-sized scans and wide slides, which makes printing unpredictable and the file awkward to scroll through. Fix PDF Page Size puts every page on the same sheet size: A4, Letter, Legal, A3, A5, Tabloid or a custom width and height in inches or millimetres. Each page is scaled and centred, and you decide whether the whole page must stay visible or the sheet should be filled edge to edge. The resizing happens in your browser.',
        howItWorks: [
            'Drop a single PDF. A preview shows the shape of the new sheet.',
            'Pick a size, or choose Custom and enter a width and height in inches or mm. Set Orientation to Auto, Portrait or Landscape.',
            'Under "When shapes differ", choose "Fit the whole page" or "Fill the page", and pick a Gap colour for any empty margins.',
            'Press the Resize button. The new file downloads with "_standardized" in its name.'
        ],
        useCases: [
            { title: 'Printing a mixed document', body: 'Combine Letter pages from a US partner with your A4 pages and print the lot on A4 paper without anything spilling off the edge.' },
            { title: 'Expense reports with small receipts', body: 'Scaled receipt scans sit centred on full pages, so an expense PDF looks consistent and prints on standard paper.' },
            { title: 'Submitting to portals with strict rules', body: 'Courts, universities and grant portals often require every page to be A4 or Letter. Convert the file before uploading it.' },
            { title: 'Preparing pages for binding', body: 'Give every page the same size and orientation before a print shop binds a thesis or manual.' }
        ],
        faqs: [
            { q: 'What is the difference between Fit and Fill?', a: 'Fit the whole page shrinks or enlarges each page until all of it fits, leaving coloured margins where the shapes differ. Fill the page scales until the sheet has no gaps, which can cut off the edges of pages with a different shape.' },
            { q: 'Does resizing turn my pages into images?', a: 'No. Each original page is placed onto the new sheet as vector content, so text stays sharp when you zoom or print.' },
            { q: 'Will links and form fields still work?', a: 'The visible page content is kept, but interactive parts such as clickable links, comments and fillable fields are not carried over to the resized pages. Fill in forms before resizing.' },
            { q: 'Why won\'t my file resize?', a: 'Password protected or encrypted PDFs cannot be resized. Remove the password with Decrypt PDF first, then try again.' }
        ]
    },
    'linearize-pdf': {
        intro: 'When a large PDF is opened from a website or a shared link, many viewers wait for the entire file to download before showing anything. A linearized PDF, also called Fast Web View, is arranged so the first page comes at the start of the file and later pages can be fetched as the reader needs them. Linearize PDF rewrites your files into that layout using qpdf, the same open-source tool many publishing workflows rely on. Pages look exactly the same, and the processing happens on your device.',
        howItWorks: [
            'Drop the PDFs you plan to put online or share by link.',
            'Use Add files for more, or remove any you do not need.',
            'Press Optimize. Each file is rewritten in linearized order.',
            'The result downloads with "_fast_web" added to the name, or several files come as one ZIP.'
        ],
        useCases: [
            { title: 'Catalogues and brochures on a website', body: 'Let visitors see the cover of a long product catalogue quickly instead of watching a blank loading screen.' },
            { title: 'Documents in a learning platform', body: 'Course readers and handbooks hosted on an LMS open on the first page sooner for students on slow connections.' },
            { title: 'Files for document management systems', body: 'Some archives and intranet portals recommend or require Fast Web View for large uploads.' }
        ],
        faqs: [
            { q: 'Will linearizing make my PDF smaller?', a: 'Not usually. Linearizing changes the order of the data inside the file, not how much of it there is, and it adds a small index, so the size stays about the same. Use Compress PDF if you need a smaller file.' },
            { q: 'Does it help when the PDF is opened from my computer?', a: 'Hardly at all. The benefit shows when a file is served over the web by a server that supports partial downloads, so a viewer can fetch the first page before the rest.' },
            { q: 'How do I check that a PDF is linearized?', a: 'Open it in View PDF Metadata and look for "Fast web view". In Adobe Acrobat, the document properties show "Fast Web View: Yes".' },
            { q: 'Why did a file fail to optimize?', a: 'Badly damaged files or PDFs that need a password to open can fail. Try Repair PDF, or remove the password with Decrypt PDF first.' }
        ]
    },
    'page-dimensions': {
        intro: 'Before printing, binding or uploading a PDF to a portal with strict rules, you may need to know exactly how big its pages are and whether they all match. View Page Dimensions measures every page and shows its width and height in inches, millimetres, points or pixels, the closest standard paper size such as A4, Letter or Legal, its orientation, aspect ratio, area and any rotation. A summary flags files that mix page sizes. The file is measured in your browser without being uploaded.',
        howItWorks: [
            'Drop a single PDF. Every page is measured as soon as it loads.',
            'Read the summary: how many pages, how many different sizes, and which sizes appear.',
            'Switch the unit between Inches, mm, Points and Pixels to update the Every page table.',
            'Export the table as a CSV file, or press Check another file to measure a different PDF.'
        ],
        useCases: [
            { title: 'Checking a file before it goes to print', body: 'Confirm a flyer really is A5 or a poster is Tabloid before a print shop charges for the wrong paper.' },
            { title: 'Finding the odd page in a merged document', body: 'Spot the single Letter page or landscape spreadsheet hiding among A4 pages, then fix it with Fix PDF Page Size.' },
            { title: 'Meeting submission rules', body: 'Journals, courts and application portals often specify page size. Check before submitting and avoid a rejection.' },
            { title: 'Planning images and layouts', body: 'Use the pixel measurement to size artwork or screenshots that need to match a page.' }
        ],
        faqs: [
            { q: 'Which paper sizes can it recognise?', a: 'A4, A3, A5, Letter, Legal, Tabloid and Executive, in either orientation, allowing for tiny rounding differences. Any other size is listed as Custom.' },
            { q: 'How are pixels calculated?', a: 'PDF pages are measured in points, where 72 points make one inch. Pixels are worked out at 96 per inch, the standard screen resolution, so an A4 page is about 794 by 1123 pixels.' },
            { q: 'What does the Rotation column mean?', a: 'Some PDFs store a page upright and tell viewers to turn it when showing it. Rotation shows that instruction in degrees. The width and height are those of the page before the rotation is applied.' }
        ]
    },
    'deskew-pdf': {
        intro: 'Pages fed into a scanner at a slight angle come out crooked, which looks careless and can make OCR less accurate. Deskew PDF measures the tilt of every page in a scanned PDF and turns the crooked ones back so lines of text run level. You choose how small a tilt is worth fixing and how much detail to use when measuring, and a page by page list shows the angle found and whether each page was straightened. Straightening runs on your device, so scans of private papers stay private.',
        howItWorks: [
            'Drop one or more scanned PDFs.',
            'Under Straightening, pick a Sensitivity from Very high (0.1°) to Low (2°), and a Scan detail from Fast to Finest.',
            'Press Straighten. Each file shows how many of its pages were straightened.',
            'Check the page by page list of tilt angles, then download the "_deskewed" file, or a ZIP for several.'
        ],
        useCases: [
            { title: 'Cleaning up office scans', body: 'Contracts and letters run through a sheet feeder often skew a little on each page. Straighten them before filing.' },
            { title: 'Before running OCR', body: 'Text recognition works better on level lines, so deskew a scan first and then pass it to OCR PDF.' },
            { title: 'Phone and flatbed scans of books', body: 'Pages photographed or scanned by hand are rarely perfectly square. Level them for a neater reading copy.' }
        ],
        faqs: [
            { q: 'Will my text still be selectable after deskewing?', a: 'No. Every page in the output is saved as an image at the Scan detail you chose, including pages that were already straight. Any existing text layer is lost, so run OCR PDF afterwards if you need searchable text.' },
            { q: 'Why was a page left as is?', a: 'Its measured tilt was smaller than the Sensitivity you picked, or larger than 45°, which is treated as a turned page rather than a tilted one. Use Rotate PDF for pages that are sideways or upside down.' },
            { q: 'Which Scan detail should I choose?', a: 'Standard suits most documents. Fine or Finest measure more precisely and keep small print sharper, but take longer and can produce a larger file. Fast is useful for quick drafts.' },
            { q: 'Should I use it on PDFs made on a computer?', a: 'There is no need. Digital PDFs are already straight, and converting their pages to images would make the text unselectable.' }
        ]
    },
    'validate-signature-pdf': {
        intro: 'A digitally signed PDF, such as an e-signed contract or an official certificate, carries a signature with a certificate that names the signer. Validate PDF Signature reads those signatures and shows who signed, their organisation and email, the signing time and reason, who issued the certificate and whether it has expired. It also flags a signature that does not cover the whole file, a sign that something was added after signing. Orbit does not yet check signatures cryptographically, so use a dedicated signature validator when the result matters. The file is checked on your device.',
        howItWorks: [
            'Drop a signed PDF. The signatures are read right away.',
            'Read the summary, such as "Signature found, no problems spotted", "Signed, but check the details" or "No signature found".',
            'Open each signature to see the signer, signing date, certificate issuer, validity dates, coverage and method.',
            'Optionally, under Trusted certificate, add the signer\'s .pem, .crt or .cer file and the PDF is checked again against it.'
        ],
        useCases: [
            { title: 'A first look at a signed contract', body: 'See who signed an agreement, when, and whether the file was changed after the signature was added, before you open a full validator.' },
            { title: 'Checking certificate expiry', body: 'Find out whether the signer\'s certificate had expired or was not yet active, which many signature checkers treat as a problem.' },
            { title: 'Confirming a signer you already know', body: 'Add a certificate a partner sent you separately to see whether it matches the one inside their signed PDF.' },
            { title: 'Telling digital signatures from pasted images', body: 'Find out whether a PDF holds a real digital signature or just a picture of a handwritten one.' }
        ],
        faqs: [
            { q: 'Does "no problems spotted" prove the signature is genuine?', a: 'No. Orbit reads the signature and its certificate and checks coverage and expiry, but it does not yet verify the signature cryptographically or check the certificate against trusted authorities. For legal or financial decisions, confirm the file in Adobe Acrobat or another dedicated signature validator.' },
            { q: 'What does "Changed after signing" mean?', a: 'The signed part of the file ends before the end of the PDF, so more data was added after that signature. This can be harmless, such as a second signature or a filled form field, but it is worth checking what changed.' },
            { q: 'Why does it say "Signer not confirmed"?', a: 'The certificate was issued by the signer to themselves, so nothing independent vouches for their identity. If you have the signer\'s certificate from a trusted source, add it under Trusted certificate.' },
            { q: 'Why does my signed PDF show "No signature found"?', a: 'A signature drawn with a mouse or pasted as an image is not a digital signature, so there is nothing to check. Some e-signature services also use formats this tool cannot read.' }
        ]
    }
};
