/**
 * Ultra-lightweight, zero-dependency PDF generator for Node.js / Vercel Serverless.
 * Produces valid PDF 1.4 documents without requiring binary libraries or native canvas.
 */

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");
}

function wordWrap(text: string, maxCharsPerLine: number = 85): string[] {
  const lines: string[] = [];
  const rawLines = text.split("\n");

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

export interface PdfSection {
  title?: string;
  body: string;
}

export function generateSimplePdf(docTitle: string, sections: PdfSection[]): Buffer {
  const allLines: { text: string; isHeader: boolean; isSubheader: boolean }[] = [];

  allLines.push({ text: docTitle.toUpperCase(), isHeader: true, isSubheader: false });
  allLines.push({ text: `Generated on ${new Date().toLocaleDateString()} | AI Startup Co-founder`, isHeader: false, isSubheader: true });
  allLines.push({ text: "--------------------------------------------------------------------------------", isHeader: false, isSubheader: false });
  allLines.push({ text: "", isHeader: false, isSubheader: false });

  for (const section of sections) {
    if (section.title) {
      allLines.push({ text: "", isHeader: false, isSubheader: false });
      allLines.push({ text: section.title.toUpperCase(), isHeader: true, isSubheader: false });
    }
    const wrapped = wordWrap(section.body, 80);
    for (const line of wrapped) {
      allLines.push({ text: line, isHeader: false, isSubheader: false });
    }
  }

  // PDF Page Layout: Standard US Letter (612 x 792 pt)
  // Margins: Left 50, Top 740, Bottom 50
  const lineHeight = 14;
  const topMargin = 740;
  const bottomMargin = 50;
  const linesPerPage = Math.floor((topMargin - bottomMargin) / lineHeight);

  // Group lines into pages
  const pages: { text: string; isHeader: boolean; isSubheader: boolean }[][] = [];
  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) {
    pages.push([{ text: docTitle, isHeader: true, isSubheader: false }]);
  }

  // Build PDF Objects
  // 1: Catalog
  // 2: Font Regular (Helvetica)
  // 3: Font Bold (Helvetica-Bold)
  // 4: Pages list
  // 5+: Page and Content stream objects
  const pageCount = pages.length;
  const pageObjStart = 5;
  const contentObjStart = pageObjStart + pageCount;

  const objects: string[] = [];

  // Catalog (1 0 obj)
  objects[1] = `<< /Type /Catalog /Pages 4 0 R >>`;

  // Fonts (2 0 obj and 3 0 obj)
  objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  // Pages parent (4 0 obj)
  const kidsArray = Array.from({ length: pageCount }, (_, i) => `${pageObjStart + i} 0 R`).join(" ");
  objects[4] = `<< /Type /Pages /Kids [${kidsArray}] /Count ${pageCount} >>`;

  // Create Page and Content objects
  for (let i = 0; i < pageCount; i++) {
    const pageObjId = pageObjStart + i;
    const contentObjId = contentObjStart + i;

    // Page object
    objects[pageObjId] = `<< /Type /Page /Parent 4 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 2 0 R /F2 3 0 R >> >> /Contents ${contentObjId} 0 R >>`;

    // Stream content
    let streamText = "BT\n";
    let currentY = topMargin;

    for (const item of pages[i]) {
      if (item.isHeader) {
        streamText += `/F2 13 Tf\n`;
      } else if (item.isSubheader) {
        streamText += `/F1 9 Tf\n`;
      } else {
        streamText += `/F1 10 Tf\n`;
      }

      const escaped = escapePdfText(item.text);
      streamText += `1 0 0 1 50 ${currentY} Tm (${escaped}) Tj\n`;
      currentY -= lineHeight;
    }

    streamText += "ET\n";

    const streamBuffer = Buffer.from(streamText, "utf-8");
    objects[contentObjId] = `<< /Length ${streamBuffer.length} >>\nstream\n${streamText}endstream`;
  }

  // Construct final PDF binary representation
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (let id = 1; id < objects.length; id++) {
    offsets[id] = Buffer.byteLength(pdf, "utf-8");
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf-8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let id = 1; id < objects.length; id++) {
    const offsetStr = String(offsets[id]).padStart(10, "0");
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf-8");
}
